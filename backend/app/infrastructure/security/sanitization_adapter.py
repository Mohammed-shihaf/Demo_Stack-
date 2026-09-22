import html
import os
import re
from pathlib import Path

class SanitizationAdapter:
    @staticmethod
    def escape_html(text: str) -> str:
        """
        Escapes HTML special characters for XSS defense.
        """
        if not text or not isinstance(text, str):
            return ""
        return html.escape(text, quote=True)

    @staticmethod
    def sanitize_file_path(user_input: str, base_dir: str = None) -> str:
        """
        Sanitizes file path to prevent directory traversal attacks.
        """
        if not user_input or not isinstance(user_input, str):
            raise ValueError("Invalid file path argument")
        base = Path(base_dir or os.getcwd()).resolve()
        target = (base / user_input).resolve()
        if not str(target).startswith(str(base)):
            raise ValueError("Path traversal attempt detected")
        return str(target)

    @staticmethod
    def escape_regex(text: str) -> str:
        """
        Escapes special regex characters to prevent ReDoS injection.
        """
        if not text or not isinstance(text, str):
            return ""
        return re.escape(text)
