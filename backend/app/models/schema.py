from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.database import Base
from datetime import datetime

class L2Snapshot(Base):
    __tablename__ = "l2_snapshots"

    # TimescaleDB hypertables often use the time column and an ID as primary keys or just index them heavily.
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, primary_key=True)
    
    # Wall detection metrics
    buy_wall_volume = Column(Float, nullable=False)
    sell_wall_volume = Column(Float, nullable=False)
    
    # Spread and mid price at the time of snapshot
    mid_price = Column(Float, nullable=False)
    spread = Column(Float, nullable=False)
    
class TradeHistory(Base):
    __tablename__ = "trade_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, primary_key=True)
    
    trade_type = Column(String, nullable=False) # 'buy' or 'sell'
    execution_type = Column(String, nullable=False) # 'paper' or 'real'
    price = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    pnl = Column(Float, default=0.0)
