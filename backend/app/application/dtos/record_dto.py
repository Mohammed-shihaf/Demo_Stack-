from pydantic import BaseModel, Field
from typing import Optional

class CreateRecordDto(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = ""

class RecordResponseDto(BaseModel):
    id: str
    title: str
    description: str
    createdAt: str
