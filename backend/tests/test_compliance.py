import pytest
from httpx import AsyncClient, ASGITransport
from app.main import create_app
from app.domain.services.compliance_service import ComplianceDomainService

@pytest.mark.asyncio
async def test_pci_dss_masking():
    pan = "4111222233334444"
    masked = ComplianceDomainService.mask_cardholder_pan(pan)
    assert masked == "411122******4444"

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/compliance/pci/mask-pan", json={"pan": "4000123456789010"})
        assert res.status_code == 200
        assert res.json()["maskedPan"] == "400012******9010"
        assert res.json()["isPciCompliant"] is True

@pytest.mark.asyncio
async def test_ferpa_and_coppa():
    student = {
        "studentId": "12345678",
        "email": "alice@school.edu",
        "address": "Campus Way",
    }
    redacted = ComplianceDomainService.redact_student_pii(student)
    assert redacted["studentId"] == "STU-***-678"
    assert redacted["email"] == "a***@school.edu"
    assert redacted["address"] == "[REDACTED FOR FERPA COMPLIANCE]"

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Child under 13 without consent
        res_no_consent = await client.post("/api/compliance/coppa/verify-consent", json={"age": 10, "hasParentalConsent": False})
        assert res_no_consent.status_code == 200
        assert res_no_consent.json()["compliant"] is False
        assert res_no_consent.json()["requiresConsent"] is True

        # Child under 13 with verified consent
        res_with_consent = await client.post("/api/compliance/coppa/verify-consent", json={
            "age": 10,
            "hasParentalConsent": True,
            "consentTimestamp": "2026-05-20T10:00:00Z"
        })
        assert res_with_consent.status_code == 200
        assert res_with_consent.json()["compliant"] is True

@pytest.mark.asyncio
async def test_hipaa_sanitization():
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/compliance/hipaa/sanitize-ephi", json={
            "patientName": "John Doe",
            "ssn": "000-11-2222",
            "mrn": "MRN-101",
            "diagnosis": "Healthy",
        })
        assert res.status_code == 200
        data = res.json()["sanitized"]
        assert data["patientName"] == "[DE-IDENTIFIED]"
        assert "ssn" not in data
        assert "mrn" not in data
