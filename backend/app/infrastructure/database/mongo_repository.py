from typing import List, Optional
from datetime import datetime
from app.domain.entities.record import RecordEntity

class MongoRecordRepository:
    def __init__(self, mongo_client=None, db_name: str = "demo_stack"):
        self.mongo_client = mongo_client
        self.db_name = db_name
        self.in_memory_store: dict[str, RecordEntity] = {}
        self.in_memory_id_seq = 1

    async def create(self, title: str, description: str = "") -> RecordEntity:
        if self.mongo_client:
            try:
                db = self.mongo_client[self.db_name]
                doc = {"title": title, "description": description, "createdAt": datetime.utcnow()}
                res = await db.records.insert_one(doc)
                return RecordEntity(id=str(res.inserted_id), title=title, description=description, created_at=doc["createdAt"])
            except Exception as e:
                print(f"[MongoRecordRepository] DB insert failed: {e}, using memory store")

        rec_id = f"rec-{self.in_memory_id_seq}"
        self.in_memory_id_seq += 1
        entity = RecordEntity(id=rec_id, title=title, description=description, created_at=datetime.utcnow())
        self.in_memory_store[rec_id] = entity
        return entity

    async def find_by_id(self, record_id: str) -> Optional[RecordEntity]:
        if self.mongo_client:
            try:
                db = self.mongo_client[self.db_name]
                doc = await db.records.find_one({"_id": record_id})
                if doc:
                    return RecordEntity(id=str(doc["_id"]), title=doc["title"], description=doc.get("description", ""), created_at=doc.get("createdAt", datetime.utcnow()))
            except Exception:
                pass

        return self.in_memory_store.get(record_id)

    async def find_all(self, limit: int = 50, skip: int = 0) -> List[RecordEntity]:
        if self.mongo_client:
            try:
                db = self.mongo_client[self.db_name]
                cursor = db.records.find().skip(skip).limit(limit)
                docs = await cursor.to_list(length=limit)
                return [RecordEntity(id=str(d["_id"]), title=d["title"], description=d.get("description", ""), created_at=d.get("createdAt", datetime.utcnow())) for d in docs]
            except Exception:
                pass

        all_items = list(self.in_memory_store.values())
        return all_items[skip:skip + limit]

    async def find_by_title_or_description(self, query: str) -> List[RecordEntity]:
        q = query.lower()
        return [
            r for r in self.in_memory_store.values()
            if q in r.title.lower() or q in r.description.lower()
        ]
