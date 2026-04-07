from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, Optional
from datetime import datetime, timezone

class PracticeState(BaseModel):
    """Daily practice state"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    date: str  # YYYY-MM-DD format
    state: Dict[str, Any]  # Checklist items
    counters: Dict[str, int] = Field(default_factory=dict)
    wird_state: Dict[str, Any] = Field(default_factory=dict)
    ramadan_state: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PracticeStateCreate(BaseModel):
    date: str
    state: Dict[str, Any]
    counters: Optional[Dict[str, int]] = None
    wird_state: Optional[Dict[str, Any]] = None
    ramadan_state: Optional[Dict[str, Any]] = None

class History(BaseModel):
    """User history and statistics"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    days: Dict[str, Any]
    day_scores: Dict[str, float]
    streak: int = 0
    best_streak: int = 0
    total_days: int = 0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HistoryUpdate(BaseModel):
    days: Dict[str, Any]
    day_scores: Dict[str, float]
    streak: int
    best_streak: int
    total_days: int
