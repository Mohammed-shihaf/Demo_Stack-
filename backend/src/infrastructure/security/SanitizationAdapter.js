'use strict';

const path = require('path');

class SanitizationAdapter {
  /**
   * Prevents XSS by escaping HTML special characters.
   */
  static escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Defends against directory path traversal attacks.
   */
  static sanitizeFilePath(userInput, baseDir = process.cwd()) {
    if (typeof userInput !== 'string') {
      throw new Error('Invalid file path argument');
    }
    const resolvedBase = path.resolve(baseDir);
    const resolved = path.resolve(resolvedBase, userInput);
    if (!resolved.startsWith(resolvedBase + path.sep) && resolved !== resolvedBase) {
      throw new Error('Path traversal attempt detected');
    }
    return resolved;
  }

  /**
   * Escapes regular expression special characters to avoid ReDoS / injection.
   */
  static escapeRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = SanitizationAdapter;
