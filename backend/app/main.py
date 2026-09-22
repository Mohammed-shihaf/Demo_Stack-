from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.presentation.middlewares.security_headers import SecurityHeadersMiddleware

from app.infrastructure.database.mongo_repository import MongoRecordRepository
from app.infrastructure.search.elasticsearch_adapter import ElasticsearchAdapter
from app.infrastructure.messaging.sns_publisher import SnsEventPublisher
from app.infrastructure.messaging.ses_notifier import SesEmailNotifier

from app.application.use_cases.record_use_cases import (
    CreateRecordUseCase,
    GetRecordByIdUseCase,
    ListRecordsUseCase,
    SearchRecordsUseCase,
    ExportFormatUseCase,
)

from app.presentation.api.routes_record import get_record_router
from app.presentation.api.routes_search import get_search_router
from app.presentation.api.routes_compliance import router as compliance_router
from app.presentation.api.routes_performance import router as performance_router

def create_app(custom_dependencies: dict = None) -> FastAPI:
    custom_dependencies = custom_dependencies or {}
    
    app = FastAPI(
        title="Demo_Stack Python Unified Backend",
        version="1.0.0",
        description="Clean Architecture (DDD) Python Backend Testbed",
    )

    # Middlewares
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(SecurityHeadersMiddleware)

    # Adapters
    record_repo = custom_dependencies.get("record_repository") or MongoRecordRepository()
    search_adapter = custom_dependencies.get("search_adapter") or ElasticsearchAdapter()
    sns_publisher = custom_dependencies.get("sns_publisher") or SnsEventPublisher()
    ses_notifier = custom_dependencies.get("ses_notifier") or SesEmailNotifier()

    # Use Cases
    use_cases = {
        "create_record": CreateRecordUseCase(record_repo, search_adapter, sns_publisher, ses_notifier),
        "get_record": GetRecordByIdUseCase(record_repo),
        "list_records": ListRecordsUseCase(record_repo),
        "search_records": SearchRecordsUseCase(search_adapter, record_repo),
        "export_format": ExportFormatUseCase(record_repo),
    }

    # Probes
    @app.get("/health")
    async def health():
        return {"status": "UP", "timestamp": datetime.utcnow().isoformat()}

    @app.get("/ready")
    async def ready():
        return {"status": "READY", "timestamp": datetime.utcnow().isoformat()}

    # Routers
    app.include_router(get_record_router(use_cases))
    app.include_router(get_search_router(use_cases))
    app.include_router(compliance_router)
    app.include_router(performance_router)

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
