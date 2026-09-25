import json
from datetime import datetime
from typing import Dict, Any

class SnsEventPublisher:
    def __init__(self, topic_arn: str = "arn:aws:sns:us-east-1:000000000000:records-topic"):
        self.topic_arn = topic_arn
        self.published_events = []

    async def publish_record_created(self, record: dict) -> Dict[str, Any]:
        payload = {
            "eventType": "RECORD_CREATED",
            "data": record,
            "timestamp": datetime.utcnow().isoformat(),
        }
        self.published_events.append(payload)
        return payload
