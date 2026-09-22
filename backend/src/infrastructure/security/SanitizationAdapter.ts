import * as path from 'path';

export class SanitizationAdapter {
  /**
   * Prevents XSS by escaping HTML special characters.
   */
  static escapeHtml(str?: string): string {
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
  static sanitizeFilePath(userInput: string, baseDir: string = process.cwd()): string {
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
   * Escapes regular expression special characters to prevent ReDoS.
   */
  static escapeRegex(str?: string): string {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default SanitizationAdapter;
