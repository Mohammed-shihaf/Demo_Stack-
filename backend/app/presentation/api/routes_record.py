from fastapi import APIRouter, HTTPException, Query, Response
from typing import List, Optional
from app.application.dtos.record_dto import CreateRecordDto, RecordResponseDto

def get_record_router(use_cases) -> APIRouter:
    router = APIRouter(prefix="/api/records", tags=["Records"])

    @router.post("", response_model=RecordResponseDto, status_code=201)
    async def create_record(dto: CreateRecordDto):
        try:
            return await use_cases["create_record"].execute(dto)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @router.get("", response_model=List[RecordResponseDto])
    async def list_records(limit: int = Query(50, ge=1), skip: int = Query(0, ge=0)):
        return await use_cases["list_records"].execute(limit=limit, skip=skip)

    @router.get("/export")
    async def export_records(format: str = Query("json")):
        fmt = format.lower()
        output = await use_cases["export_format"].execute(format_type=fmt)
        if fmt == "csv":
            return Response(content=output, media_type="text/csv")
        if fmt == "xml":
            return Response(content=output, media_type="application/xml")
        return output

    @router.get("/{record_id}", response_model=RecordResponseDto)
    async def get_record(record_id: str):
        record = await use_cases["get_record"].execute(record_id)
        if not record:
            raise HTTPException(status_code=404, detail=f"Record {record_id} not found")
        return record

    return router
