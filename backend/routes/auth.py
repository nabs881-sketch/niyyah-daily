from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import UserCreate, UserLogin, User, Token
from auth import hash_password, verify_password, create_access_token
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_router(db: AsyncIOMotorDatabase):
    
    @router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
    async def register(user_data: UserCreate):
        """Register a new user"""
        # Check if user exists
        existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user_dict = {
            "id": str(uuid.uuid4()),
            "email": user_data.email,
            "name": user_data.name,
            "password_hash": hash_password(user_data.password),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_dict)
        
        # Create token
        access_token = create_access_token({"sub": user_dict["id"]})
        
        user = User(
            id=user_dict["id"],
            email=user_dict["email"],
            name=user_dict["name"],
            created_at=datetime.fromisoformat(user_dict["created_at"])
        )
        
        return Token(access_token=access_token, user=user)
    
    @router.post("/login", response_model=Token)
    async def login(credentials: UserLogin):
        """Login user"""
        # Find user
        user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user_doc["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create token
        access_token = create_access_token({"sub": user_doc["id"]})
        
        user = User(
            id=user_doc["id"],
            email=user_doc["email"],
            name=user_doc.get("name"),
            created_at=datetime.fromisoformat(user_doc["created_at"])
        )
        
        return Token(access_token=access_token, user=user)
    
    return router
