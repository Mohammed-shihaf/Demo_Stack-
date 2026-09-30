from app.domain.services.loan_eligibility_service import LoanEligibilityService


def assess(**overrides):
    args = dict(
        age=35,
        annual_income=100000,
        credit_score=780,
        existing_debt=10000,
        employment_type="salaried",
        loan_amount=200000,
        has_guarantor=False,
    )
    args.update(overrides)
    return LoanEligibilityService.assess(**args)


def test_underage_is_rejected():
    result = assess(age=17)
    assert result["approved"] is False
    assert result["reason"] == "underage"


def test_low_risk_salaried_is_approved():
    result = assess()
    assert result["approved"] is True
    assert result["risk"] == "low"
    assert result["rate"] == 7.5


def test_medium_risk_is_approved_with_higher_rate():
    result = assess(credit_score=700)
    assert result["approved"] is True
    assert result["risk"] == "medium"
    assert result["rate"] == 9.5


def test_amount_above_income_multiple_is_rejected():
    result = assess(loan_amount=600000)
    assert result["approved"] is False
    assert result["reason"] == "amount-too-high"
