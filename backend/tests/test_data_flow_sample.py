from app.domain.services.data_flow_sample_service import DataFlowSampleService


def test_accumulate_with_early_exit_stops_at_ceiling():
    assert DataFlowSampleService.accumulate_with_early_exit([10, 20, 30, 40], 45) == 45


def test_accumulate_with_early_exit_sums_without_hitting_ceiling():
    assert DataFlowSampleService.accumulate_with_early_exit([1, 2, 3], 100) == 6


def test_derive_discount_tier_gold():
    result = DataFlowSampleService.derive_discount_tier(1500)
    assert result["tier"] == "gold"
    assert result["discountRate"] == 0.15


def test_derive_discount_tier_silver():
    result = DataFlowSampleService.derive_discount_tier(500)
    assert result["tier"] == "silver"
    assert result["discountRate"] == 0.08


def test_derive_discount_tier_standard_returns_early_with_no_discount():
    result = DataFlowSampleService.derive_discount_tier(50)
    assert result["tier"] == "standard"
    assert result["discountRate"] == 0
    assert result["note"] == "no discount applied"


def test_build_adjacency_sample_counts_connected_edges():
    adjacency, edge_count = DataFlowSampleService.build_adjacency_sample(4)
    assert len(adjacency) == 4
    assert edge_count > 0


def test_build_adjacency_sample_empty_when_node_count_is_zero():
    adjacency, edge_count = DataFlowSampleService.build_adjacency_sample(0)
    assert len(adjacency) == 0
    assert edge_count == 0
