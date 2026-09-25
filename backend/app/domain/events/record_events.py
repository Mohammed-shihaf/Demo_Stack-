from typing import Callable, List, Dict, Any

class RecordEventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[Any], None]]] = {}

    def subscribe(self, event_name: str, handler: Callable[[Any], None]):
        if event_name not in self._subscribers:
            self._subscribers[event_name] = []
        self._subscribers[event_name].append(handler)

    def emit(self, event_name: str, data: Any):
        if event_name in self._subscribers:
            for handler in self._subscribers[event_name]:
                try:
                    handler(data)
                except Exception as e:
                    print(f"[EventBus] Error handling event {event_name}: {e}")

record_event_bus = RecordEventBus()

RECORD_CREATED = "record:created"
RECORD_UPDATED = "record:updated"
RECORD_DELETED = "record:deleted"
