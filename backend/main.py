import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import status, bot_control, system, auth, exchange_keys, trades, notifications, bot_details, portfolio
from app.api.ws import ccxt_stream, notifications as notifications_ws
from app.db.database import create_tables
from app.db.timescale import setup_hyper_tables
from app.db.redis import redis_client
from app.services.ccxt_manager import CCXTManager

app = FastAPI(title="Crypto Algo Trading Bot API")

class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        msg = record.getMessage()
        return "/api/bot/state" not in msg and "/api/status/health" not in msg

logging.getLogger("uvicorn.access").addFilter(EndpointFilter())

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(status.router, prefix="/api/status", tags=["Status"])
app.include_router(bot_control.router, prefix="/api/bot", tags=["Bot Control"])
app.include_router(bot_details.router, prefix="/api/bot", tags=["Bot Details"])
app.include_router(ccxt_stream.router, prefix="/api/ws", tags=["WebSocket Data Stream"])
app.include_router(notifications_ws.router, prefix="/api/ws/notifications", tags=["WebSocket Notifications"])
app.include_router(system.router, prefix="/api/system", tags=["System & Background Tasks"])
app.include_router(exchange_keys.router, prefix="/api/exchange-keys", tags=["Exchange API Keys"])
app.include_router(trades.router, prefix="/api/trades", tags=["Trade History"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
from app.api.routes import telegram
app.include_router(telegram.router, prefix="/api/telegram", tags=["Telegram Integration"])

@app.on_event("startup")
async def startup_event():
    await create_tables()
    await setup_hyper_tables()
    await redis_client.connect()
    
    from app.core.config import settings
    if settings.TELEGRAM_BOT_TOKEN:
        from app.services.telegram.client import poll_telegram_updates
        import asyncio
        asyncio.create_task(poll_telegram_updates())

@app.on_event("shutdown")
async def shutdown_event():
    await CCXTManager.close_all()
    await redis_client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
