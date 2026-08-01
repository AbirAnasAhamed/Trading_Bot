from pydantic import BaseModel, ConfigDict
from datetime import datetime

class TradeHistoryBase(BaseModel):
    symbol: str
    trade_type: str
    execution_type: str
    price: float
    amount: float
    pnl: float = 0.0

class TradeHistoryCreate(TradeHistoryBase):
    pass

class TradeHistoryResponse(TradeHistoryBase):
    id: int
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
