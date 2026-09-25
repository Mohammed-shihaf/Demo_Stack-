import pytest

from app.domain.services.control_flow_sample_service import ControlFlowSampleService


def test_parse_strict_integer_empty_input_path():
    result = ControlFlowSampleService.parse_strict_integer("")
    assert result["ok"] is False
    assert result["reason"] == "empty-input"


def test_parse_strict_integer_normal_return_path():
    result = ControlFlowSampleService.parse_strict_integer("42")
    assert result["ok"] is True
    assert result["value"] == 42


def test_parse_strict_integer_exception_path():
    result = ControlFlowSampleService.parse_strict_integer("not-a-number")
    assert result["ok"] is False
    assert "Not an integer" in result["reason"]


def test_sum_until_threshold_zero_iterations():
    result = ControlFlowSampleService.sum_until_threshold([], 10)
    assert result["sum"] == 0
    assert result["stoppedEarly"] is False
    assert result["itemsSeen"] == 0


def test_sum_until_threshold_completes_without_crossing_threshold():
    result = ControlFlowSampleService.sum_until_threshold([1, 2, 3], 100)
    assert result["sum"] == 6
    assert result["stoppedEarly"] is False


def test_sum_until_threshold_stops_early():
    result = ControlFlowSampleService.sum_until_threshold([10, 10, 10, 10], 15)
    assert result["stoppedEarly"] is True
    assert result["sum"] >= 15


@pytest.mark.parametrize(
    "weight_kg,is_fragile,destination_zone,expected",
    [
        (15, True, "international", "freight-fragile-intl"),
        (5, True, "international", "priority-fragile-intl"),
        (25, True, "domestic", "freight-fragile-domestic"),
        (5, True, "domestic", "priority-fragile-domestic"),
        (35, False, "international", "freight-intl"),
        (5, False, "international", "standard-intl"),
        (60, False, "domestic", "freight-domestic"),
        (5, False, "domestic", "standard-domestic"),
    ],
)
def test_classify_shipment_all_branches(weight_kg, is_fragile, destination_zone, expected):
    assert ControlFlowSampleService.classify_shipment(weight_kg, is_fragile, destination_zone) == expected


def test_classify_shipment_rejects_non_positive_weight():
    with pytest.raises(ValueError):
        ControlFlowSampleService.classify_shipment(0, False, "domestic")
