import pytest
from httpx import AsyncClient, ASGITransport
from app.main import create_app
from app.domain.services.record_analytics_service import RecordAnalyticsDomainService

@pytest.mark.asyncio
async def test_cubic_complexity_and_n_plus_one():
    # Domain algorithm test
    items = ["a", "b", "c", "d", "e"]
    res = RecordAnalyticsDomainService.compute_cubic_combinations(items)
    assert res["inputSize"] == 5
    assert res["iterations"] == 125
    assert res["tripletCount"] == 10

    # API endpoint test
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        api_res = await client.get("/api/performance/cubic-complexity?size=10")
        assert api_res.status_code == 200
        assert api_res.json()["inputSize"] == 10
        assert api_res.json()["iterations"] == 1000

        n_plus_one_res = await client.get("/api/performance/n-plus-one?count=5")
        assert n_plus_one_res.status_code == 200
        assert n_plus_one_res.json()["totalQueriesExecuted"] == 6
        assert n_plus_one_res.json()["isNPlusOneDetected"] is True
