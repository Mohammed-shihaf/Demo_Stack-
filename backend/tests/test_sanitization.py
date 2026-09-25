import pytest
from app.infrastructure.security.sanitization_adapter import SanitizationAdapter

def test_xss_escaping():
    raw = '<script>alert("xss")</script>&foo'
    escaped = SanitizationAdapter.escape_html(raw)
    assert "&lt;script&gt;" in escaped
    assert "&amp;foo" in escaped

def test_path_traversal():
    safe = SanitizationAdapter.sanitize_file_path("sub/data.json", "C:\\workspace")
    assert "data.json" in safe

    with pytest.raises(ValueError):
        SanitizationAdapter.sanitize_file_path("../../etc/passwd", "C:\\workspace")

def test_regex_escaping():
    raw = "[test] (foo)*+?."
    escaped = SanitizationAdapter.escape_regex(raw)
    assert "\\[test\\]" in escaped
