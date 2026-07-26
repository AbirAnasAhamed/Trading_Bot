from sqlalchemy import text
from app.db.database import engine

async def setup_hyper_tables():
    """
    Initializes TimescaleDB hypertables for our time-series data.
    """
    async with engine.begin() as conn:
        # Create extension if not exists
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;'))
        
        # Turn l2_snapshots into a hypertable
        try:
            await conn.execute(text("SELECT create_hypertable('l2_snapshots', 'timestamp', if_not_exists => TRUE);"))
            print("Hypertable 'l2_snapshots' initialized.")
        except Exception as e:
            print(f"L2 Snapshot Hypertable msg: {e}")
            
        # Turn trade_history into a hypertable
        try:
            await conn.execute(text("SELECT create_hypertable('trade_history', 'timestamp', if_not_exists => TRUE);"))
            print("Hypertable 'trade_history' initialized.")
        except Exception as e:
            print(f"Trade History Hypertable msg: {e}")
