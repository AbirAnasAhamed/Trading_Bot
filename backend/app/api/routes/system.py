from fastapi import APIRouter
from app.worker.tasks import run_backtest, train_ml_model

router = APIRouter()

@router.post("/test-backtest")
async def trigger_backtest():
    """
    Trigger a background backtest task via Celery.
    """
    task = run_backtest.delay("MACD Crossover", "BTC/USDT", "15m")
    return {"message": "Backtest started in background", "task_id": task.id}

@router.post("/test-ml")
async def trigger_ml_training():
    """
    Trigger a background ML training task via Celery.
    """
    task = train_ml_model.delay("Orderbook-LSTM", {"epochs": 100, "batch_size": 32})
    return {"message": "ML training started in background", "task_id": task.id}
