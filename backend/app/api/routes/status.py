import time
import psutil
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi.concurrency import run_in_threadpool

from app.db.database import get_db
from app.db.redis import redis_client
from app.core.celery_app import celery_app

router = APIRouter()

START_TIME = time.time()

class SystemHealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    cpu_usage: float
    ram_usage: float
    components: dict

@router.get("/", response_model=SystemHealthResponse)
async def get_status():
    return SystemHealthResponse(
        status="online",
        uptime_seconds=time.time() - START_TIME,
        cpu_usage=psutil.cpu_percent(interval=None),
        ram_usage=psutil.virtual_memory().percent,
        components={}
    )

@router.get("/health", response_model=SystemHealthResponse)
async def get_health(db: AsyncSession = Depends(get_db)):
    components = {
        "api": "online",
        "database": "offline",
        "redis": "offline",
        "celery": "offline"
    }
    
    overall_status = "online"
    
    # 1. Check Database
    try:
        await db.execute(text("SELECT 1"))
        components["database"] = "online"
    except Exception as e:
        overall_status = "degraded"
        
    # 2. Check Redis
    try:
        if redis_client.redis:
            await redis_client.redis.ping()
            components["redis"] = "online"
        else:
            overall_status = "degraded"
    except Exception as e:
        overall_status = "degraded"
        
    # 3. Check Celery
    try:
        def check_celery():
            return celery_app.control.ping(timeout=0.5)
            
        celery_ping = await run_in_threadpool(check_celery)
        if celery_ping and len(celery_ping) > 0:
            components["celery"] = "online"
        else:
            overall_status = "degraded"
    except Exception as e:
        overall_status = "degraded"
        
    if components["database"] == "offline" and components["redis"] == "offline":
        overall_status = "offline"
        
    cpu_usage = psutil.cpu_percent(interval=None)
    ram_usage = psutil.virtual_memory().percent

    return SystemHealthResponse(
        status=overall_status,
        uptime_seconds=time.time() - START_TIME,
        cpu_usage=cpu_usage,
        ram_usage=ram_usage,
        components=components
    )
