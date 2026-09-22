import pytest
from httpx import AsyncClient, ASGITransport
from app.main import create_app

@pytest.mark.asyncio
async def test_health_and_probes():
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "UP"

        ready_res = await client.get("/ready")
        assert ready_res.status_code == 200
        assert ready_res.json()["status"] == "READY"

@pytest.mark.asyncio
async def test_security_headers():
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.headers["x-frame-options"] == "DENY"
        assert res.headers["x-content-type-options"] == "nosniff"
        assert "Strict-Transport-Security" in res.headers

@pytest.mark.asyncio
async def test_record_crud():
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create
        create_res = await client.post("/api/records", json={"title": "Py Record 1", "description": "Python DDD"})
        assert create_res.status_code == 201
        data = create_res.json()
        assert data["title"] == "Py Record 1"
        rec_id = data["id"]

        # List
        list_res = await client.get("/api/records")
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        # Get By ID
        get_res = await client.get(f"/api/records/{rec_id}")
        assert get_res.status_code == 200
        assert get_res.json()["title"] == "Py Record 1"

        # Export
        export_json = await client.get("/api/records/export?format=json")
        assert export_json.status_code == 200

        export_csv = await client.get("/api/records/export?format=csv")
        assert export_csv.status_code == 200
        assert "Py Record 1" in export_csv.text

        export_xml = await client.get("/api/records/export?format=xml")
        assert export_xml.status_code == 200
        assert "<title>Py Record 1</title>" in export_xml.text
