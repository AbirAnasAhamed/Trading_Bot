from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
from typing import Any

from app.db.database import get_db
from app.models.schema import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token, encrypt_data
from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Register a new user.
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
        is_superuser=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login_access_token(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)) -> Any:
    """
    Get current user profile.
    """
    return current_user


