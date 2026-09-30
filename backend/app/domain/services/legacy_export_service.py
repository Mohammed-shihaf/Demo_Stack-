"""
Deliberate coverage fixture: legacy export code that no test imports, so it
shows up with 0% statement and branch coverage.
"""
from typing import Any, Dict, List


class LegacyExportService:
    @staticmethod
    def to_csv(rows: List[Dict[str, Any]], delimiter: str = ",") -> str:
        if not rows:
            return ""
        headers = list(rows[0].keys())
        lines = [delimiter.join(headers)]
        for row in rows:
            cells = []
            for header in headers:
                value = row.get(header)
                if value is None:
                    cells.append("")
                elif isinstance(value, str) and delimiter in value:
                    cells.append('"' + value.replace('"', '""') + '"')
                else:
                    cells.append(str(value))
            lines.append(delimiter.join(cells))
        return "\n".join(lines)

    @staticmethod
    def to_fixed_width(rows: List[Dict[str, Any]], width: int = 12) -> str:
        if width < 4:
            raise ValueError("width too small")
        out = []
        for row in rows:
            parts = []
            for key in sorted(row):
                text = str(row[key])
                if len(text) > width:
                    text = text[: width - 1] + "~"
                parts.append(text.ljust(width))
            out.append("".join(parts).rstrip())
        return "\n".join(out)

    @staticmethod
    def summarise(rows: List[Dict[str, Any]], field: str) -> Dict[str, float]:
        values = [r[field] for r in rows if isinstance(r.get(field), (int, float))]
        if not values:
            return {"count": 0, "min": 0.0, "max": 0.0, "avg": 0.0}
        return {
            "count": len(values),
            "min": float(min(values)),
            "max": float(max(values)),
            "avg": float(sum(values)) / len(values),
        }
