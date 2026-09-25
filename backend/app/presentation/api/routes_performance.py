import time
import os
from fastapi import APIRouter, Query
from app.domain.services.record_analytics_service import RecordAnalyticsDomainService

router = APIRouter(prefix="/api/performance", tags=["Performance"])

@router.get("/soak")
async def soak_telemetry():
    return {
        "status": "ok",
        "pid": os.getpid(),
        "timestamp": time.time(),
    }

@router.get("/spike")
async def spike_telemetry():
    return {
        "status": "ok",
        "trafficSpikeHandled": True,
        "simulatedConcurrentUsers": 100,
    }

@router.get("/cache-stats")
async def cache_stats():
    return {
        "hits": 450,
        "misses": 50,
        "hitRate": 0.90,
    }

@router.get("/cubic-complexity")
async def cubic_complexity(size: int = Query(30, le=100)):
    items = [f"item-{i+1}" for i in range(size)]
    start = time.perf_counter()
    result = RecordAnalyticsDomainService.compute_cubic_combinations(items)
    end = time.perf_counter()
    elapsed_ms = (end - start) * 1000

    return {
        **result,
        "executionTimeMs": elapsed_ms,
        "complexityNotation": "O(n^3)",
    }

@router.get("/n-plus-one")
async def n_plus_one(count: int = Query(10)):
    result = RecordAnalyticsDomainService.simulate_n_plus_one_query_pattern(
        parent_count=count,
        child_fetch_fn=lambda i: {"parentId": i, "meta": f"Child metadata {i}"},
    )
    return result

@router.get("/memory-telemetry")
async def memory_telemetry(chunks: int = Query(50), size: int = Query(2048)):
    result = RecordAnalyticsDomainService.generate_memory_allocations(chunk_count=chunks, chunk_size=size)
    return {
        **result,
        "status": "ok",
    }
