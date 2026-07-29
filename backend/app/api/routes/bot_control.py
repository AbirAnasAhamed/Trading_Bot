from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.bot_manager import bot_manager
from typing import List, Optional
from app.api.deps import get_current_active_user
from app.models.schema import User, ExchangeKey
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from sqlalchemy.future import select
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import decrypt_data

router = APIRouter()

class BotState(BaseModel):
    bot_id: str
    is_running: bool
    is_paused: bool = False
    symbol: str
    mode: str # 'paper' or 'real'

@router.get("/state", response_model=List[BotState])
async def get_all_bots_state(current_user: User = Depends(get_current_active_user)):
    # In a full SaaS, this would filter bots by current_user.id
    return bot_manager.get_all_bots()

class StartBotRequest(BaseModel):
    bot_name: str
    symbol: Optional[str] = None
    mode: Optional[str] = None
    exchange_id: Optional[str] = None
    wall_multiplier: float = 3.0
    trade_amount: float = 0.01
    min_wall_volume: float = 10000.0
    take_profit: float = 2.0
    stop_loss: float = 1.0

@router.post("/start")
async def start_bot(
    req: StartBotRequest, 
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    api_key = None
    api_secret = None
    
    if req.mode == 'real':
        if not req.exchange_id:
            raise HTTPException(status_code=400, detail="Exchange ID is required for real trading")
            
        result = await db.execute(
            select(ExchangeKey).where(
                ExchangeKey.user_id == current_user.id,
                ExchangeKey.exchange_id == req.exchange_id
            )
        )
        exchange_key = result.scalars().first()
        
        if not exchange_key:
            raise HTTPException(status_code=404, detail=f"API Keys for {req.exchange_id} not found")
            
        try:
            api_key = decrypt_data(exchange_key.encrypted_api_key)
            api_secret = decrypt_data(exchange_key.encrypted_api_secret)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to decrypt API keys")

    success = await bot_manager.start_bot(
        bot_id=req.bot_name,
        symbol=req.symbol,
        mode=req.mode,
        exchange_id=req.exchange_id,
        api_key=api_key,
        api_secret=api_secret,
        wall_multiplier=req.wall_multiplier,
        trade_amount=req.trade_amount,
        min_wall_volume=req.min_wall_volume,
        take_profit=req.take_profit,
        stop_loss=req.stop_loss
    )
    
    if not success:
        return {"message": "Bot is already running or could not be started"}
        
    return {"message": "Bot started"}

class StopBotRequest(BaseModel):
    bot_name: str

@router.post("/stop")
async def stop_bot(req: StopBotRequest, current_user: User = Depends(get_current_active_user)):
    success = await bot_manager.stop_bot(req.bot_name)
    if not success:
        return {"message": "Bot not found or already stopped"}
        
    return {"message": "Bot stopped"}

@router.post("/pause")
async def pause_bot(req: StopBotRequest, current_user: User = Depends(get_current_active_user)):
    success = bot_manager.pause_bot(req.bot_name)
    if not success:
        return {"message": "Bot not found or already paused"}
    return {"message": "Bot paused"}

@router.post("/resume")
async def resume_bot(req: StopBotRequest, current_user: User = Depends(get_current_active_user)):
    success = bot_manager.resume_bot(req.bot_name)
    if not success:
        return {"message": "Bot not found or already running"}
    return {"message": "Bot resumed"}

@router.post("/delete")
async def delete_bot(req: StopBotRequest, current_user: User = Depends(get_current_active_user)):
    success = await bot_manager.delete_bot(req.bot_name)
    if not success:
        return {"message": "Bot not found"}
    return {"message": "Bot deleted"}
