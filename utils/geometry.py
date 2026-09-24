"""Small geometry helpers shared by the spiral scripts."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5


def polar_to_cartesian(radius: float, angle_degrees: float) -> Point:
    import math

    radians = math.radians(angle_degrees)
    return Point(x=radius * math.cos(radians), y=radius * math.sin(radians))


def spiral_radius(step_index: int, growth_rate: float = 0.1) -> float:
    """Radius for a given step in an Archimedean-style spiral."""
    return step_index * growth_rate
