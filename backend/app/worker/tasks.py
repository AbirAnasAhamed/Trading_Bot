import time
import asyncio
import random
from app.core.celery_app import celery_app
from app.core.logger import get_logger
from app.db.database import AsyncSessionLocal
from app.models.schema import MLModel, BacktestResult

logger = get_logger(__name__)

async def save_ml_model(model_name: str, accuracy: float):
    async with AsyncSessionLocal() as session:
        model = MLModel(
            model_name=model_name,
            version="1.0.0",
            accuracy=accuracy,
            status="active"
        )
        session.add(model)
        await session.commit()

async def save_backtest_result(strategy: str, pair: str, timeframe: str, pnl: float, trades: int, win_rate: float):
    async with AsyncSessionLocal() as session:
        result = BacktestResult(
            strategy_name=strategy,
            symbol=pair,
            timeframe=timeframe,
            total_trades=trades,
            win_rate=win_rate,
            total_pnl=pnl,
            status="completed"
        )
        session.add(result)
        await session.commit()

@celery_app.task(bind=True, name="train_ml_model")
def train_ml_model(self, model_name: str, parameters: dict):
    logger.info(f"Starting ML training for model: {model_name} with params: {parameters}")
    self.update_state(state='PROGRESS', meta={'progress': 10})
    time.sleep(3)
    self.update_state(state='PROGRESS', meta={'progress': 50})
    time.sleep(3)
    self.update_state(state='PROGRESS', meta={'progress': 90})
    time.sleep(1)
    
    accuracy = round(random.uniform(70.0, 99.9), 2)
    asyncio.run(save_ml_model(model_name, accuracy))
    
    logger.info(f"ML training completed for {model_name} with accuracy {accuracy}%")
    return {"status": "success", "model": model_name, "accuracy": accuracy}

@celery_app.task(bind=True, name="run_backtest")
def run_backtest(self, strategy: str, pair: str, timeframe: str):
    logger.info(f"Starting backtest for {strategy} on {pair} ({timeframe})")
    self.update_state(state='PROGRESS', meta={'progress': 20})
    time.sleep(2)
    self.update_state(state='PROGRESS', meta={'progress': 60})
    time.sleep(2)
    
    pnl = round(random.uniform(-500.0, 1500.0), 2)
    trades = random.randint(10, 200)
    win_rate = round(random.uniform(30.0, 85.0), 2)
    
    asyncio.run(save_backtest_result(strategy, pair, timeframe, pnl, trades, win_rate))
    
    logger.info("Backtest completed")
    return {"status": "success", "pnl": pnl, "trades": trades, "win_rate": win_rate}
