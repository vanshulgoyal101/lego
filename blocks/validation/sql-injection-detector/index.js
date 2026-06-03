export class SqlInjectionDetector {
  /**
   * Analyzes an input string for signs of SQL injection.
   * @param {string} input - The user input to check.
   * @returns {Object} { isInjection: boolean, reason: string|null, score: number }
   */
  static detect(input) {
    if (typeof input !== 'string') {
      return { isInjection: false, reason: null, score: 0 };
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return { isInjection: false, reason: null, score: 0 };
    }

    let score = 0;
    const reasons = [];

    // 1. Check for database comments: --, /*
    const commentRegex = /(--|\/\*)/i;
    if (commentRegex.test(trimmed)) {
      score += 0.5;
      reasons.push('Contains SQL comments (-- or /*)');
    } else if (/#/.test(trimmed)) {
      score += 0.2;
      reasons.push('Contains hash symbol (#)');
    }

    // 2. Check for tautologies (e.g. OR 1=1, OR 'a'='a', etc.)
    const tautologyRegex = /\b(or|and)\b\s+(['"]?)(\w+)\2\s*=\s*\2\3/i;
    if (tautologyRegex.test(trimmed)) {
      score += 0.6;
      reasons.push('Contains tautology patterns (e.g. 1=1 or similar equal comparison)');
    }

    // 3. Check for UNION SELECT, UNION ALL SELECT
    const unionSelectRegex = /\bunion\b\s+(all\s+)?\bselect\b/i;
    if (unionSelectRegex.test(trimmed)) {
      score += 0.6;
      reasons.push('Contains UNION SELECT pattern');
    }

    // 4. Check for system functions/meta tables (information_schema, pg_sleep, delay, waitfor delay)
    const sysDbRegex = /\b(information_schema|sqlite_master|pg_sleep|waitfor\s+delay|benchmark|database\(\)|user\(\)|version\(\))\b/i;
    if (sysDbRegex.test(trimmed)) {
      score += 0.5;
      reasons.push('Contains database metadata tables or sleep/utility functions');
    }

    // 5. Check for administrative SQL commands (DROP, ALTER, CREATE, TRUNCATE, DELETE, INSERT, UPDATE)
    const adminSqlRegex = /\b(drop\s+table|alter\s+table|truncate\s+table|delete\s+from|insert\s+into|update\s+.*?\s+set)\b/i;
    if (adminSqlRegex.test(trimmed)) {
      score += 0.5;
      reasons.push('Contains destructive/modifying SQL statements (DROP/ALTER/DELETE/INSERT/UPDATE)');
    }

    // 6. Inline piggybacked queries (e.g. '; SELECT')
    const piggybackRegex = /;\s*\b(select|insert|update|delete|drop|union)\b/i;
    if (piggybackRegex.test(trimmed)) {
      score += 0.5;
      reasons.push('Contains semicolon-delimited piggybacked SQL query');
    }

    // Cap the score at 1.0
    const finalScore = Math.min(1.0, score);
    const isInjection = finalScore >= 0.5;

    return {
      isInjection,
      reason: reasons.length > 0 ? reasons.join(', ') : null,
      score: finalScore
    };
  }
}
