from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class RecordEntity:
    title: str
    description: str = ""
    id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        if not self.title or not self.title.strip():
            raise ValueError("Record title is required and cannot be empty")
        self.title = self.title.strip()
        self.description = self.description.strip() if self.description else ""

    def to_wire(self) -> dict:
        return {
            "id": str(self.id) if self.id else "",
            "title": self.title,
            "description": self.description,
            "createdAt": self.created_at.isoformat(),
        }
