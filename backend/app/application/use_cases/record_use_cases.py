from typing import List, Optional, Any
from app.domain.entities.record import RecordEntity
from app.domain.events.record_events import record_event_bus, RECORD_CREATED
from app.application.dtos.record_dto import CreateRecordDto, RecordResponseDto

class CreateRecordUseCase:
    def __init__(self, record_repository, search_adapter=None, sns_publisher=None, ses_notifier=None):
        self.record_repository = record_repository
        self.search_adapter = search_adapter
        self.sns_publisher = sns_publisher
        self.ses_notifier = ses_notifier

    async def execute(self, dto: CreateRecordDto) -> RecordResponseDto:
        entity = await self.record_repository.create(title=dto.title, description=dto.description or "")
        wire = entity.to_wire()
        response_dto = RecordResponseDto(**wire)

        # Domain event
        record_event_bus.emit(RECORD_CREATED, response_dto)

        # ElasticSearch indexing
        if self.search_adapter and hasattr(self.search_adapter, "index_record"):
            try:
                await self.search_adapter.index_record(wire)
            except Exception as e:
                print(f"[CreateRecordUseCase] Search indexing warning: {e}")

        # SNS notification
        if self.sns_publisher and hasattr(self.sns_publisher, "publish_record_created"):
            try:
                await self.sns_publisher.publish_record_created(wire)
            except Exception as e:
                print(f"[CreateRecordUseCase] SNS publish warning: {e}")

        # SES notification
        if self.ses_notifier and hasattr(self.ses_notifier, "send_record_created_notification"):
            try:
                await self.ses_notifier.send_record_created_notification(wire)
            except Exception as e:
                print(f"[CreateRecordUseCase] SES notification warning: {e}")

        return response_dto

class GetRecordByIdUseCase:
    def __init__(self, record_repository):
        self.record_repository = record_repository

    async def execute(self, record_id: str) -> Optional[RecordResponseDto]:
        if not record_id:
            raise ValueError("Record ID is required")
        entity = await self.record_repository.find_by_id(record_id)
        if not entity:
            return None
        return RecordResponseDto(**entity.to_wire())

class ListRecordsUseCase:
    def __init__(self, record_repository):
        self.record_repository = record_repository

    async def execute(self, limit: int = 50, skip: int = 0) -> List[RecordResponseDto]:
        entities = await self.record_repository.find_all(limit=limit, skip=skip)
        return [RecordResponseDto(**e.to_wire()) for e in entities]

class SearchRecordsUseCase:
    def __init__(self, search_adapter, record_repository=None):
        self.search_adapter = search_adapter
        self.record_repository = record_repository

    async def execute(self, query: str) -> List[dict]:
        if not query or not query.strip():
            return []

        if self.search_adapter and hasattr(self.search_adapter, "search"):
            try:
                return await self.search_adapter.search(query.strip())
            except Exception as e:
                print(f"[SearchRecordsUseCase] ES search failed: {e}")

        if self.record_repository and hasattr(self.record_repository, "find_by_title_or_description"):
            entities = await self.record_repository.find_by_title_or_description(query.strip())
            return [e.to_wire() for e in entities]

        return []

class ExportFormatUseCase:
    def __init__(self, record_repository):
        self.record_repository = record_repository

    async def execute(self, format_type: str = "json") -> Any:
        entities = await self.record_repository.find_all()
        records = [e.to_wire() for e in entities]

        if format_type == "csv":
            header = "id,title,description,createdAt\n"
            rows = "\n".join(f'"{r["id"]}","{r["title"]}","{r["description"]}","{r["createdAt"]}"' for r in records)
            return header + rows

        if format_type == "xml":
            items = "\n".join(
                f'  <record>\n    <id>{r["id"]}</id>\n    <title>{r["title"]}</title>\n    <description>{r["description"]}</description>\n    <createdAt>{r["createdAt"]}</createdAt>\n  </record>'
                for r in records
            )
            return f"<records>\n{items}\n</records>"

        return records
