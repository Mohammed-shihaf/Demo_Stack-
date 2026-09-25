"""
Deliberate data-flow fixtures: multiple definitions of the same variable,
cross-function parameter passing, computational vs. predicate use, and an
unreachable-use branch. Exists to give All-Definition/All-Uses coverage
analyzers concrete def-use pairs to trace, not to model real behaviour.
"""
from typing import Iterable, Tuple, List, Dict, Any


class DataFlowSampleService:
    @staticmethod
    def accumulate_with_early_exit(values: Iterable[float], ceiling: float) -> float:
        """
        `total` redefined across loop iterations (multiple-definitions handling),
        used both computationally (running sum) and as a predicate (ceiling check).
        """
        total = 0  # definition #1
        for v in values:
            total = total + v  # definition #2
            if total > ceiling:  # predicate use
                total = ceiling  # definition #3
                break
        return total  # computational use

    @staticmethod
    def _classify_tier(order_total: float) -> str:
        if order_total >= 1000:
            return "gold"
        if order_total >= 250:
            return "silver"
        return "standard"

    @staticmethod
    def derive_discount_tier(order_total: float) -> Dict[str, Any]:
        """
        Cross-function def-use: `tier` is defined in _classify_tier and consumed
        here; one branch returns early with a value never read further
        downstream (unreachable-use detection).
        """
        tier = DataFlowSampleService._classify_tier(order_total)  # cross-function definition
        if tier == "gold":
            discount_rate = 0.15
        elif tier == "silver":
            discount_rate = 0.08
        else:
            discount_rate = 0  # reachable, never re-read on this path
            return {"tier": tier, "discountRate": discount_rate, "note": "no discount applied"}
        return {"tier": tier, "discountRate": discount_rate}

    @staticmethod
    def build_adjacency_sample(node_count: int) -> Tuple[List[List[bool]], int]:
        """
        Multiple definitions of `edge_count` across nested loops, so
        Partial-Uses-Coverage and Coverage-Reporting-Validation checks have a
        realistic partially-covered function to measure.
        """
        edge_count = 0  # definition #1
        adjacency: List[List[bool]] = []
        for i in range(node_count):
            row: List[bool] = []
            for j in range(node_count):
                connected = (i + j) % 3 == 0
                row.append(connected)
                if connected:
                    edge_count = edge_count + 1  # definition #2, uses prior value
            adjacency.append(row)
        return adjacency, edge_count
