from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, ConfigDict
from typing import List
from celery.result import AsyncResult
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.worker.tasks import run_backtest, train_ml_model
from app.api.deps import get_current_active_user
from app.models.schema import User, BacktestResult, MLModel
from app.db.database import get_db
from app.schemas.backtest import BacktestResultResponse
from app.schemas.ml import MLModelResponse

router = APIRouter()

class BacktestRequest(BaseModel):
    strategy: str
    pair: str
    timeframe: str

class MLTrainingRequest(BaseModel):
    model_name: str
    epochs: int
    batch_size: int
    
    model_config = ConfigDict(protected_namespaces=())

@router.post("/test-backtest")
async def trigger_backtest(request: BacktestRequest, current_user: User = Depends(get_current_active_user)):
    """
    Trigger a background backtest task via Celery.
    """
    task = run_backtest.delay(request.strategy, request.pair, request.timeframe)
    return {"message": "Backtest started in background", "task_id": task.id}

@router.post("/test-ml")
async def trigger_ml_training(request: MLTrainingRequest, current_user: User = Depends(get_current_active_user)):
    """
    Trigger a background ML training task via Celery.
    """
    task = train_ml_model.delay(request.model_name, {"epochs": request.epochs, "batch_size": request.batch_size})
    return {"message": "ML training started in background", "task_id": task.id}

@router.get("/task/{task_id}")
async def get_task_status(task_id: str, current_user: User = Depends(get_current_active_user)):
    """
    Get status of a Celery task
    """
    task = AsyncResult(task_id)
    response = {
        "task_id": task_id,
        "status": task.status,
        "result": task.result if task.ready() else None
    }
    return response

@router.get("/backtests", response_model=List[BacktestResultResponse])
async def get_backtest_history(
    skip: int = Query(0),
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(BacktestResult).order_by(BacktestResult.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()

@router.get("/ml-models", response_model=List[MLModelResponse])
async def get_ml_models_history(
    skip: int = Query(0),
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(MLModel).order_by(MLModel.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()
