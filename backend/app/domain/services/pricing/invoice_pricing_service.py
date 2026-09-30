"""
Invoice pricing.

Deliberate test fixture: the pricing rules below are copy-pasted between the
order, subscription, invoice and rental services (and again inside this file)
so that the code-duplication metrics have real clones to report.
"""
from typing import Any, Dict, List

TIER_DISCOUNT = {"gold": 0.15, "silver": 0.10, "bronze": 0.05}
REGION_TAX = {"eu": 0.21, "us": 0.07, "in": 0.18}
COUPONS = {"WELCOME10": 0.10, "VIP20": 0.20, "FLAT5": 0.05}


class InvoicePricingService:
    @staticmethod
    def calculate_total(
        items: List[Dict[str, Any]], customer_tier: str, coupon_code: str, region: str
    ) -> Dict[str, Any]:
        if not items:
            raise ValueError("items must not be empty")
        subtotal = 0.0
        for item in items:
            price = item.get("price", 0)
            quantity = item.get("quantity", 1)
            if price < 0 or quantity <= 0:
                raise ValueError("invalid item")
            line_total = price * quantity
            if quantity >= 10:
                line_total = line_total * 0.95
            subtotal += line_total
        tier_rate = TIER_DISCOUNT.get(customer_tier, 0.0)
        coupon_rate = COUPONS.get(coupon_code, 0.0)
        discount_rate = tier_rate + coupon_rate
        if discount_rate > 0.30:
            discount_rate = 0.30
        discount = subtotal * discount_rate
        taxable = subtotal - discount
        tax_rate = REGION_TAX.get(region, 0.0)
        tax = taxable * tax_rate
        total = round(taxable + tax, 2)
        return {
            "subtotal": round(subtotal, 2),
            "discount": round(discount, 2),
            "tax": round(tax, 2),
            "total": total,
        }

    @staticmethod
    def preview_total(
        items: List[Dict[str, Any]], customer_tier: str, coupon_code: str, region: str
    ) -> Dict[str, Any]:
        if not items:
            raise ValueError("items must not be empty")
        subtotal = 0.0
        for item in items:
            price = item.get("price", 0)
            quantity = item.get("quantity", 1)
            if price < 0 or quantity <= 0:
                raise ValueError("invalid item")
            line_total = price * quantity
            if quantity >= 10:
                line_total = line_total * 0.95
            subtotal += line_total
        tier_rate = TIER_DISCOUNT.get(customer_tier, 0.0)
        coupon_rate = COUPONS.get(coupon_code, 0.0)
        discount_rate = tier_rate + coupon_rate
        if discount_rate > 0.30:
            discount_rate = 0.30
        discount = subtotal * discount_rate
        taxable = subtotal - discount
        tax_rate = REGION_TAX.get(region, 0.0)
        tax = taxable * tax_rate
        total = round(taxable + tax, 2)
        return {
            "subtotal": round(subtotal, 2),
            "discount": round(discount, 2),
            "tax": round(tax, 2),
            "total": total,
        }
