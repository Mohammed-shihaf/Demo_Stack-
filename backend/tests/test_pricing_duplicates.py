import pytest

from app.domain.services.pricing.invoice_pricing_service import InvoicePricingService
from app.domain.services.pricing.order_pricing_service import OrderPricingService
from app.domain.services.pricing.rental_pricing_service import RentalPricingService
from app.domain.services.pricing.subscription_pricing_service import SubscriptionPricingService

SERVICES = [OrderPricingService, SubscriptionPricingService, InvoicePricingService, RentalPricingService]
METHODS = ["calculate_total", "preview_total"]


@pytest.mark.parametrize("service", SERVICES)
@pytest.mark.parametrize("method", METHODS)
def test_empty_items_rejected(service, method):
    with pytest.raises(ValueError, match="empty"):
        getattr(service, method)([], "gold", "", "eu")


@pytest.mark.parametrize("service", SERVICES)
@pytest.mark.parametrize("method", METHODS)
@pytest.mark.parametrize("item", [{"price": -1, "quantity": 1}, {"price": 5, "quantity": 0}])
def test_invalid_item_rejected(service, method, item):
    with pytest.raises(ValueError, match="invalid"):
        getattr(service, method)([item], "gold", "", "eu")


@pytest.mark.parametrize("service", SERVICES)
@pytest.mark.parametrize("method", METHODS)
def test_plain_total_no_discount_unknown_region(service, method):
    result = getattr(service, method)([{"price": 10, "quantity": 2}], "none", "", "xx")
    assert result == {"subtotal": 20.0, "discount": 0.0, "tax": 0.0, "total": 20.0}


@pytest.mark.parametrize("service", SERVICES)
@pytest.mark.parametrize("method", METHODS)
def test_bulk_line_discount_applies_from_ten_units(service, method):
    result = getattr(service, method)([{"price": 10, "quantity": 10}], "none", "", "xx")
    assert result["subtotal"] == 95.0


@pytest.mark.parametrize("service", SERVICES)
@pytest.mark.parametrize("method", METHODS)
def test_tier_coupon_and_tax(service, method):
    result = getattr(service, method)([{"price": 100, "quantity": 1}], "silver", "FLAT5", "us")
    assert result["discount"] == 15.0
    assert result["tax"] == 5.95
    assert result["total"] == 90.95


@pytest.mark.parametrize("service", SERVICES)
@pytest.mark.parametrize("method", METHODS)
def test_discount_is_capped_at_thirty_percent(service, method):
    result = getattr(service, method)([{"price": 100, "quantity": 1}], "gold", "VIP20", "xx")
    assert result["discount"] == 30.0
    assert result["total"] == 70.0
