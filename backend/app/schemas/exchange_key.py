from pydantic import BaseModel
from datetime import datetime

class ExchangeKeyBase(BaseModel):
    exchange_id: str

class ExchangeKeyCreate(ExchangeKeyBase):
    api_key: str
    api_secret: str

class ExchangeKeyResponse(ExchangeKeyBase):
    id: int
    is_active: bool
    created_at: datetime
    # We don't send back the actual API key and secret for security reasons,
    # but we can send a masked version to show it exists.
    masked_api_key: str

    class Config:
        from_attributes = True
