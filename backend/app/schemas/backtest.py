from pydantic import BaseModel, ConfigDict
from datetime import datetime

class BacktestResultResponse(BaseModel):
    id: int
    strategy_name: str
    symbol: str
    timeframe: str
    total_trades: int
    win_rate: float
    total_pnl: float
    max_drawdown: float
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
