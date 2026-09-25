import re
from typing import Dict, Any, Optional

class ComplianceDomainService:
    @staticmethod
    def mask_cardholder_pan(pan: Optional[str]) -> str:
        """
        PCI-DSS PAN masking: Preserves first 6 and last 4 digits.
        """
        if not pan or not isinstance(pan, str):
            return ""
        cleaned = re.sub(r"[\s-]", "", pan)
        if len(cleaned) < 10:
            return "*" * len(cleaned)
        first_6 = cleaned[:6]
        last_4 = cleaned[-4:]
        masked_middle = "*" * (len(cleaned) - 10)
        return f"{first_6}{masked_middle}{last_4}"

    @staticmethod
    def redact_student_pii(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        FERPA / COPPA: Redacts student personally identifiable information.
        """
        if not record or not isinstance(record, dict):
            return record or {}
        sanitized = dict(record)

        if "studentId" in sanitized and sanitized["studentId"]:
            sanitized["studentId"] = f"STU-***-{str(sanitized['studentId'])[-3:]}"

        if "email" in sanitized and sanitized["email"] and "@" in sanitized["email"]:
            parts = sanitized["email"].split("@")
            sanitized["email"] = f"{parts[0][0]}***@{parts[1]}"

        if "address" in sanitized:
            sanitized["address"] = "[REDACTED FOR FERPA COMPLIANCE]"

        if "dateOfBirth" in sanitized:
            sanitized["dateOfBirth"] = "[REDACTED]"

        return sanitized

    @staticmethod
    def verify_coppa_consent(age: Optional[int], has_parental_consent: bool, consent_timestamp: Optional[str]) -> Dict[str, Any]:
        """
        COPPA: Verifies verifiable parental consent for users under 13.
        """
        is_under_13 = isinstance(age, (int, float)) and age < 13
        if not is_under_13:
            return {"compliant": True, "requiresConsent": False}

        has_valid_consent = bool(has_parental_consent and consent_timestamp)
        return {
            "compliant": has_valid_consent,
            "requiresConsent": True,
            "reason": "Verified parental consent present" if has_valid_consent else "Missing verifiable parental consent for child under 13",
        }

    @staticmethod
    def sanitize_ephi(health_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        HIPAA: Sanitizes Electronic Protected Health Information identifiers.
        """
        if not health_record or not isinstance(health_record, dict):
            return health_record or {}
        sanitized = dict(health_record)

        sanitized.pop("ssn", None)
        sanitized.pop("mrn", None)
        sanitized.pop("biometricIdentifiers", None)

        if "patientName" in sanitized:
            sanitized["patientName"] = "[DE-IDENTIFIED]"

        return sanitized
