from fastapi import APIRouter, Query
from typing import List

def get_search_router(use_cases) -> APIRouter:
    router = APIRouter(prefix="/api/search", tags=["Search"])

    @router.get("")
    async def search_records(q: str = Query("")):
        if not q.strip():
            return []
        return await use_cases["search_records"].execute(q)

    return router
