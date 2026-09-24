"""Draw a simple family of spirals using turtle graphics.

No build manifest is included on purpose: this repo intentionally has no
requirements.txt, pyproject.toml, setup.py, Pipfile, runtime.txt, or
.python-version, so a language scanner can identify Python from source
alone, while build type, language version, and project type all stay
undetected. This mirrors the TP-5871 repro scenario (turtle_spirals).
"""

import math
import turtle


def draw_spiral(pen: turtle.Turtle, turns: int, step: float, angle: float) -> None:
    """Draw one spiral arm starting from the pen's current position."""
    length = step
    for _ in range(turns):
        pen.forward(length)
        pen.right(angle)
        length += step * 0.05


def spiral_family(count: int, base_angle: float = 91.0) -> None:
    """Draw `count` spiral arms spaced evenly around a circle."""
    screen = turtle.Screen()
    screen.bgcolor("black")

    pen = turtle.Turtle()
    pen.speed(0)
    pen.hideturtle()

    colors = ["red", "orange", "yellow", "green", "cyan", "blue", "magenta"]
    step_between_arms = 360.0 / count

    for i in range(count):
        pen.pencolor(colors[i % len(colors)])
        draw_spiral(pen, turns=120, step=2.0, angle=base_angle)
        pen.penup()
        pen.setposition(0, 0)
        pen.setheading(step_between_arms * (i + 1))
        pen.pendown()

    screen.exitonclick()


def golden_angle_degrees() -> float:
    """Return the golden angle in degrees, used for a denser spiral pattern."""
    return 360.0 * (2.0 - (1 + math.sqrt(5)) / 2.0)


if __name__ == "__main__":
    spiral_family(count=6)
