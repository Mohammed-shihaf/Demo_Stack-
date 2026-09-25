from datetime import datetime
from typing import Dict, Any

class SesEmailNotifier:
    def __init__(self, from_email: str = "notifications@example.com"):
        self.from_email = from_email
        self.sent_emails = []

    async def send_record_created_notification(self, record: dict, recipient: str = "admin@example.com") -> Dict[str, Any]:
        payload = {
            "from": self.from_email,
            "to": recipient,
            "subject": f"Notification: New Record Created - {record.get('title')}",
            "body": f"Record ID: {record.get('id')}\nTitle: {record.get('title')}\nDescription: {record.get('description')}",
            "timestamp": datetime.utcnow().isoformat(),
        }
        self.sent_emails.append(payload)
        return payload
