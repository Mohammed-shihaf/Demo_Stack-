# turtle-spirals

A tiny turtle-graphics demo that draws a family of spiral arms.

This test-data branch intentionally ships **no build manifest** — no
`requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile`, `runtime.txt`,
or `.python-version`. Source files alone are enough for a language scanner
to detect Python, but there is nothing here to resolve a build type,
language version, or project type from.

Used to retest TP-5871 (coverage preview must block Continue/Execute when
build type, language version, or project type can't be determined, even
though a language was detected).

## Files

- `spirals.py` — draws several spiral arms with turtle graphics
- `utils/geometry.py` — small polar/cartesian helpers used by the spiral math
