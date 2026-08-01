from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
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
    bot_id = Column(String, index=True, nullable=True) # ID of the bot that executed this trade
    price = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    pnl = Column(Float, default=0.0)

# ==========================================
# Future SaaS & Advanced Features Schemas
# ==========================================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    notifications_enabled = Column(Boolean, default=True, nullable=False)
    
    exchange_keys = relationship("ExchangeKey", back_populates="user", cascade="all, delete-orphan")

class ExchangeKey(Base):
    __tablename__ = "exchange_keys"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exchange_id = Column(String, index=True, nullable=False) # e.g. "binance", "bybit"
    encrypted_api_key = Column(String, nullable=False)
    encrypted_api_secret = Column(String, nullable=False)
    encrypted_passphrase = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="exchange_keys")

class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String, index=True, nullable=False)
    version = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    status = Column(String, default="training") # training, active, archived
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BacktestResult(Base):
    __tablename__ = "backtest_results"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    strategy_name = Column(String, index=True, nullable=False)
    symbol = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    
    # Metrics
    total_trades = Column(Integer, default=0)
    win_rate = Column(Float, default=0.0)
    total_pnl = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    
    # Context
    status = Column(String, default="running") # running, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info") # info, success, warning, error
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User")

