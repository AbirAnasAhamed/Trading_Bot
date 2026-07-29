from celery import Celery
import os

# Use environment variables for flexible configuration, fallback to local defaults if missing
redis_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "cryptobot",
    broker=redis_url,
    backend=redis_url,
    include=["app.worker.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Worker optimization settings for RAM and CPU efficiency
    worker_concurrency=2, # Keep it low to save RAM
    worker_prefetch_multiplier=1, # Ensures long-running tasks don't block other tasks
    task_time_limit=3600, # Max 1 hour per task
)
