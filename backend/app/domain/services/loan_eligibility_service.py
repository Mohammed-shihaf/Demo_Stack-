"""
Deliberate coverage fixture: many independent branches. The tests in
tests/test_loan_eligibility.py exercise only some of them, so statement and
branch coverage come out as real partial numbers (not 0% and not 100%).
"""
from typing import Any, Dict


def _reject(reason: str) -> Dict[str, Any]:
    return {"approved": False, "reason": reason, "rate": None}


class LoanEligibilityService:
    @staticmethod
    def assess(
        age: int,
        annual_income: float,
        credit_score: int,
        existing_debt: float,
        employment_type: str,
        loan_amount: float,
        has_guarantor: bool,
    ) -> Dict[str, Any]:
        if age < 18:
            return _reject("underage")
        if age > 70:
            return _reject("over-age")
        if annual_income <= 0:
            return _reject("no-income")

        debt_to_income = existing_debt / annual_income

        if credit_score >= 750:
            risk = "low"
            rate = 7.5
        elif credit_score >= 650:
            risk = "medium"
            rate = 9.5
        elif credit_score >= 550:
            risk = "high"
            rate = 12.5
            if not has_guarantor:
                return _reject("guarantor-required")
        else:
            return _reject("score-too-low")

        if employment_type == "salaried":
            max_multiple = 5
        elif employment_type == "self-employed":
            max_multiple = 3
            if debt_to_income > 0.4:
                return _reject("self-employed-debt-too-high")
        elif employment_type == "contract":
            max_multiple = 2
        else:
            return _reject("unknown-employment")

        if loan_amount > annual_income * max_multiple:
            return _reject("amount-too-high")
        if debt_to_income > 0.5:
            return _reject("debt-too-high")

        return {"approved": True, "reason": "ok", "rate": rate, "risk": risk}
