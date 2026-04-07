from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.practice import PracticeState, PracticeStateCreate, History, HistoryUpdate
from auth import get_current_user_id
import uuid
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/practice", tags=["practice"])

def get_practice_router(db: AsyncIOMotorDatabase):
    
    @router.get("/state/{date}", response_model=Optional[PracticeState])
    async def get_practice_state(date: str, user_id: str = Depends(get_current_user_id)):
        """Get practice state for a specific date"""
        doc = await db.practice_states.find_one(
            {"user_id": user_id, "date": date},
            {"_id": 0}
        )
        
        if not doc:
            return None
        
        # Convert ISO strings back to datetime
        if isinstance(doc.get('created_at'), str):
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
        if isinstance(doc.get('updated_at'), str):
            doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
        
        return PracticeState(**doc)
    
    @router.post("/state", response_model=PracticeState)
    async def save_practice_state(
        practice_data: PracticeStateCreate,
        user_id: str = Depends(get_current_user_id)
    ):
        """Save or update practice state"""
        # Check if exists
        existing = await db.practice_states.find_one(
            {"user_id": user_id, "date": practice_data.date},
            {"_id": 0}
        )
        
        now = datetime.now(timezone.utc)
        
        if existing:
            # Update existing
            update_data = practice_data.model_dump()
            update_data["updated_at"] = now.isoformat()
            # Ensure None values become empty dicts
            if update_data.get("counters") is None:
                update_data["counters"] = {}
            if update_data.get("wird_state") is None:
                update_data["wird_state"] = {}
            if update_data.get("ramadan_state") is None:
                update_data["ramadan_state"] = {}
            
            await db.practice_states.update_one(
                {"user_id": user_id, "date": practice_data.date},
                {"$set": update_data}
            )
            
            doc = await db.practice_states.find_one(
                {"user_id": user_id, "date": practice_data.date},
                {"_id": 0}
            )
        else:
            # Create new
            data_dict = practice_data.model_dump()
            # Ensure None values become empty dicts
            if data_dict.get("counters") is None:
                data_dict["counters"] = {}
            if data_dict.get("wird_state") is None:
                data_dict["wird_state"] = {}
            if data_dict.get("ramadan_state") is None:
                data_dict["ramadan_state"] = {}
                
            doc = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                **data_dict,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }
            await db.practice_states.insert_one(doc)
        
        # Convert ISO strings
        if isinstance(doc.get('created_at'), str):
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
        if isinstance(doc.get('updated_at'), str):
            doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
        
        return PracticeState(**doc)
    
    @router.get("/history", response_model=Optional[History])
    async def get_history(user_id: str = Depends(get_current_user_id)):
        """Get user history and statistics"""
        doc = await db.histories.find_one({"user_id": user_id}, {"_id": 0})
        
        if not doc:
            return None
        
        if isinstance(doc.get('updated_at'), str):
            doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
        
        return History(**doc)
    
    @router.post("/history", response_model=History)
    async def save_history(
        history_data: HistoryUpdate,
        user_id: str = Depends(get_current_user_id)
    ):
        """Save or update user history"""
        existing = await db.histories.find_one({"user_id": user_id}, {"_id": 0})
        
        now = datetime.now(timezone.utc)
        
        if existing:
            # Update
            update_data = history_data.model_dump()
            update_data["updated_at"] = now.isoformat()
            
            await db.histories.update_one(
                {"user_id": user_id},
                {"$set": update_data}
            )
            
            doc = await db.histories.find_one({"user_id": user_id}, {"_id": 0})
        else:
            # Create
            doc = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                **history_data.model_dump(),
                "updated_at": now.isoformat()
            }
            await db.histories.insert_one(doc)
        
        if isinstance(doc.get('updated_at'), str):
            doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
        
        return History(**doc)
    
    return router
