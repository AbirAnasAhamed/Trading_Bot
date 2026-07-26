from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import status, bot_control
from app.db.database import create_tables
from app.db.timescale import setup_hyper_tables

app = FastAPI(title="Crypto Algo Trading Bot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(status.router, prefix="/api/status", tags=["Status"])
app.include_router(bot_control.router, prefix="/api/bot", tags=["Bot Control"])

@app.on_event("startup")
async def startup_event():
    await create_tables()
    await setup_hyper_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
