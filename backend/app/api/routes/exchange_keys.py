from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.database import get_db
from app.models.schema import User, ExchangeKey
from app.api.deps import get_current_active_user
from app.schemas.exchange_key import ExchangeKeyCreate, ExchangeKeyResponse
from app.core.security import encrypt_data, decrypt_data

router = APIRouter()

@router.get("/", response_model=List[ExchangeKeyResponse])
async def get_exchange_keys(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all configured exchange keys for the current user.
    """
    result = await db.execute(
        select(ExchangeKey).where(ExchangeKey.user_id == current_user.id)
    )
    keys = result.scalars().all()
    
    response_keys = []
    for key in keys:
        try:
            # We don't decrypt unless we need it for ccxt, but we want to show a masked version
            decrypted_api_key = decrypt_data(key.encrypted_api_key)
            masked = f"****{decrypted_api_key[-4:]}" if len(decrypted_api_key) >= 4 else "****"
            
            response_keys.append(ExchangeKeyResponse(
                id=key.id,
                exchange_id=key.exchange_id,
                is_active=key.is_active,
                created_at=key.created_at,
                masked_api_key=masked
            ))
        except Exception:
            # Handle potential decryption errors (e.g., secret key changed) gracefully
            response_keys.append(ExchangeKeyResponse(
                id=key.id,
                exchange_id=key.exchange_id,
                is_active=key.is_active,
                created_at=key.created_at,
                masked_api_key="[Encryption Error]"
            ))
            
    return response_keys

@router.post("/", response_model=ExchangeKeyResponse)
async def add_or_update_exchange_key(
    key_data: ExchangeKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add or update API keys for a specific exchange.
    """
    # Check if key already exists for this exchange
    result = await db.execute(
        select(ExchangeKey).where(
            ExchangeKey.user_id == current_user.id,
            ExchangeKey.exchange_id == key_data.exchange_id
        )
    )
    existing_key = result.scalars().first()
    
    encrypted_key = encrypt_data(key_data.api_key)
    encrypted_secret = encrypt_data(key_data.api_secret)
    
    if existing_key:
        existing_key.encrypted_api_key = encrypted_key
        existing_key.encrypted_api_secret = encrypted_secret
        key_record = existing_key
    else:
        key_record = ExchangeKey(
            user_id=current_user.id,
            exchange_id=key_data.exchange_id,
            encrypted_api_key=encrypted_key,
            encrypted_api_secret=encrypted_secret
        )
        db.add(key_record)
        
    await db.commit()
    await db.refresh(key_record)
    
    masked = f"****{key_data.api_key[-4:]}" if len(key_data.api_key) >= 4 else "****"
    
    return ExchangeKeyResponse(
        id=key_record.id,
        exchange_id=key_record.exchange_id,
        is_active=key_record.is_active,
        created_at=key_record.created_at,
        masked_api_key=masked
    )

@router.delete("/{exchange_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exchange_key(
    exchange_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete API keys for a specific exchange.
    """
    result = await db.execute(
        select(ExchangeKey).where(
            ExchangeKey.user_id == current_user.id,
            ExchangeKey.exchange_id == exchange_id
        )
    )
    existing_key = result.scalars().first()
    
    if not existing_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key for exchange '{exchange_id}' not found."
        )
        
    await db.delete(existing_key)
    await db.commit()
    return None
