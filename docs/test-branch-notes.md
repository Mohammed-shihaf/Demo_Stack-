# Test branch: duplication and coverage fixtures

This branch is `stack/python` plus fixtures that make the duplication and coverage
metrics report real, non-trivial numbers. Nothing in the existing app code was changed.

## What was added

| File | Purpose | What to expect |
|---|---|---|
| `backend/app/domain/services/pricing/order_pricing_service.py` | Copy of the pricing rules | Code duplication |
| `backend/app/domain/services/pricing/subscription_pricing_service.py` | Same body, different class name | Code duplication |
| `backend/app/domain/services/pricing/invoice_pricing_service.py` | Same body, different class name | Code duplication |
| `backend/app/domain/services/pricing/rental_pricing_service.py` | Same body, different class name | Code duplication |
| `backend/app/domain/services/loan_eligibility_service.py` | 14 decision points, only some tested | Partial statement and branch coverage |
| `backend/app/domain/services/legacy_export_service.py` | Only imported, never called | Very low coverage |
| `backend/tests/test_pricing_duplicates.py` | Covers the pricing services fully | 100% on the four pricing files |
| `backend/tests/test_loan_eligibility.py` | 4 tests: underage, low risk, medium risk, amount too high | 59% statements, 54% with branches |
| `backend/tests/test_legacy_export_smoke.py` | Import check only | 22% on the legacy file |

Every pricing service contains `calculate_total` and `preview_total`, which are identical,
and the four files repeat the same block, so each block appears 8 times.

## Not covered on purpose (loan eligibility)
over-age, no income, high-risk with and without a guarantor, score too low, self-employed,
contract, unknown employment type, and debt-to-income above 0.5.

## Check locally
```
cd backend
python -m pytest
```
The command prints the per-file coverage table and writes `coverage.xml`.

## Measured on this branch (local run, before the platform analysis)
| Metric | `stack/python` | This branch |
|---|---|---|
| Duplicated lines (jscpd, 5 lines / 50 tokens, `backend/app`) | 0 (0%) | 246 lines (19.04%) in 7 clones |
| Statement coverage, whole backend (pytest-cov) | 84% | 83% (818 statements before the smoke test) |
| Loan eligibility statement / branch coverage | - | 59% / 54% |
| Legacy export statement / branch coverage | - | 22% |
| Tests | 32 | 93, all passing |
