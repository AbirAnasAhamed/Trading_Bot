from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class MLModelResponse(BaseModel):
    id: int
    model_name: str
    version: str
    accuracy: Optional[float] = None
    status: str
    file_path: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
