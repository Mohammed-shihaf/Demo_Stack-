from typing import List, Dict, Any

class ElasticsearchAdapter:
    def __init__(self, node: str = "http://localhost:9200", index: str = "records"):
        self.node = node
        self.index = index
        self.in_memory_index: Dict[str, dict] = {}

    async def ensure_index(self):
        pass

    async def index_record(self, record: dict):
        rec_id = str(record.get("id", ""))
        self.in_memory_index[rec_id] = record

    async def search(self, query: str) -> List[dict]:
        q = query.lower()
        return [
            r for r in self.in_memory_index.values()
            if q in r.get("title", "").lower() or q in r.get("description", "").lower()
        ]
