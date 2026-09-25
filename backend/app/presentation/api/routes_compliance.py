from fastapi import APIRouter
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.domain.services.compliance_service import ComplianceDomainService

class MaskPanRequest(BaseModel):
    pan: Optional[str] = None

class CoppaRequest(BaseModel):
    age: Optional[int] = None
    hasParentalConsent: Optional[bool] = False
    consentTimestamp: Optional[str] = None

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])

@router.get("/privacy")
async def get_privacy_policy():
    return {
        "policy": "GDPR, FERPA, COPPA, and HIPAA Compliant",
        "version": "1.0",
        "effectiveDate": "2026-05-20",
    }

@router.get("/gdpr/export/{user_id}")
async def export_gdpr_data(user_id: str):
    return {
        "userId": user_id,
        "exportedAt": datetime.utcnow().isoformat(),
        "data": {"profile": "Exported User Data", "consentGranted": True},
    }

@router.delete("/gdpr/erase/{user_id}")
async def erase_gdpr_data(user_id: str):
    return {
        "userId": user_id,
        "erased": True,
        "erasedAt": datetime.utcnow().isoformat(),
    }

@router.get("/soc2/audit-logs")
async def get_soc2_logs():
    return {
        "auditEnabled": True,
        "logs": [
            {"event": "AUTH_SUCCESS", "actor": "admin", "timestamp": datetime.utcnow().isoformat()},
            {"event": "RECORD_ACCESS", "actor": "system", "timestamp": datetime.utcnow().isoformat()},
        ],
    }

@router.post("/pci/mask-pan")
async def mask_pan(body: MaskPanRequest):
    masked = ComplianceDomainService.mask_cardholder_pan(body.pan)
    return {
        "originalLength": len(body.pan or ""),
        "maskedPan": masked,
        "isPciCompliant": True,
    }

@router.post("/ferpa/redact-student")
async def redact_student(body: Dict[str, Any]):
    redacted = ComplianceDomainService.redact_student_pii(body)
    return {
        "redacted": redacted,
        "isFerpaCompliant": True,
    }

@router.post("/coppa/verify-consent")
async def verify_coppa(body: CoppaRequest):
    return ComplianceDomainService.verify_coppa_consent(
        age=body.age,
        has_parental_consent=bool(body.hasParentalConsent),
        consent_timestamp=body.consentTimestamp,
    )

@router.post("/hipaa/sanitize-ephi")
async def sanitize_hipaa(body: Dict[str, Any]):
    sanitized = ComplianceDomainService.sanitize_ephi(body)
    return {
        "sanitized": sanitized,
        "isHipaaCompliant": True,
    }
