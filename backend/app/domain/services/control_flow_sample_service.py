"""
Deliberate control-flow fixtures: exception paths, loop paths with zero and
multiple iterations, and a multi-branch function -- for path/branch coverage
and mutation testing (each branch needs a real assertion to kill a mutant).
"""
from typing import List, Dict, Any


class ControlFlowSampleService:
    @staticmethod
    def parse_strict_integer(raw: str) -> Dict[str, Any]:
        """
        Three distinct exit paths: empty-input short-circuit, normal return,
        and a caught exception -- for exception-path handling and
        multi-function path tracking.
        """
        if raw is None or raw == "":
            return {"ok": False, "reason": "empty-input"}  # path 1
        try:
            n = int(raw)
            return {"ok": True, "value": n}  # path 2
        except ValueError:
            return {"ok": False, "reason": f"Not an integer: {raw}"}  # path 3

    @staticmethod
    def sum_until_threshold(values: List[float], threshold: float) -> Dict[str, Any]:
        """
        Loop body may run zero, one, or many times depending on input -- for
        loop-path detection and complete-coverage-path verification.
        """
        total = 0
        stopped_early = False
        for v in values:
            total += v
            if total >= threshold:
                stopped_early = True
                break
        return {"sum": total, "stoppedEarly": stopped_early, "itemsSeen": len(values)}

    @staticmethod
    def classify_shipment(weight_kg: float, is_fragile: bool, destination_zone: str) -> str:
        """
        Nested conditionals with real branching depth, for cyclomatic
        complexity and mutation-testing metrics.
        """
        if weight_kg <= 0:
            raise ValueError("weight_kg must be positive")
        if is_fragile:
            if destination_zone == "international":
                return "freight-fragile-intl" if weight_kg > 10 else "priority-fragile-intl"
            return "freight-fragile-domestic" if weight_kg > 20 else "priority-fragile-domestic"
        if destination_zone == "international":
            return "freight-intl" if weight_kg > 30 else "standard-intl"
        return "freight-domestic" if weight_kg > 50 else "standard-domestic"
