// ============================================================
// Normalization — Semantic text comparison for Indian documents
// Rectification #2: No brittle SHA-256 hashing
// ============================================================

/**
 * Normalizes user-entered text for semantic comparison.
 * Handles: whitespace variance, zero-width chars, localized
 * commas/separators, and case differences.
 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")   // Zero-width chars
    .replace(/\s+/g, " ")                      // Collapse whitespace
    .replace(/[,،٫]/g, "")                     // Localized commas
    .replace(/[।|]/g, "")                      // Devanagari/pipe separators
    .replace(/[.\-_]/g, "")                     // Common punctuation variance
    .trim();
}

/**
 * Parses Indian financial values into canonical integer (whole rupees).
 *
 * Handles:
 * - "₹2,50,000" → 250000
 * - "2.5 lakh"  → 250000
 * - "250000"    → 250000
 * - "₹ 2,50,000/-" → 250000
 * - Devanagari numerals (०-९)
 * - Kannada numerals (೦-೯)
 */
export function parseFinancialValue(input: string): number | null {
  let cleaned = input.replace(/[₹\s,/\\-]+/g, "").trim();

  // Handle "lakh" / "lac" suffix
  const lakhMatch = cleaned.match(/^(\d+\.?\d*)\s*(?:lakh|lac|l)/i);
  if (lakhMatch && lakhMatch[1]) return Math.round(parseFloat(lakhMatch[1]) * 100_000);

  // Handle "crore" / "cr" suffix
  const croreMatch = cleaned.match(/^(\d+\.?\d*)\s*(?:crore|cr|c)/i);
  if (croreMatch && croreMatch[1]) return Math.round(parseFloat(croreMatch[1]) * 10_000_000);

  // Handle "thousand" / "k" suffix
  const thousandMatch = cleaned.match(/^(\d+\.?\d*)\s*(?:thousand|k)/i);
  if (thousandMatch && thousandMatch[1]) return Math.round(parseFloat(thousandMatch[1]) * 1_000);

  // Devanagari numerals → ASCII
  cleaned = cleaned.replace(/[०-९]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48)
  );

  // Kannada numerals → ASCII
  cleaned = cleaned.replace(/[೦-೯]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0x0CE6 + 48)
  );

  // Telugu numerals → ASCII
  cleaned = cleaned.replace(/[౦-౯]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0x0C66 + 48)
  );

  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Jaro-Winkler distance for fuzzy text comparison.
 * Returns 0.0 (no match) to 1.0 (identical).
 *
 * Use threshold >= 0.92 for "same value" in document validation.
 * Use threshold >= 0.85 for "likely same person" in name matching.
 */
export function jaroWinklerDistance(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  const maxDist = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  if (maxDist < 0) return s1 === s2 ? 1.0 : 0.0;

  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matching characters
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - maxDist);
    const end = Math.min(i + maxDist + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3;

  // Winkler modification — boost for common prefix (up to 4 chars)
  let prefix = 0;
  const prefixLimit = Math.min(4, Math.min(s1.length, s2.length));
  for (let i = 0; i < prefixLimit; i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * Compare two text values semantically after normalization.
 * Returns true if they are "the same value" within the Jaro-Winkler threshold.
 */
export function semanticMatch(
  a: string,
  b: string,
  threshold: number = 0.92
): boolean {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  return jaroWinklerDistance(normA, normB) >= threshold;
}

/**
 * Compare two financial values after parsing.
 * Returns true if they represent the same amount.
 */
export function financialMatch(a: string, b: string): boolean {
  const valA = parseFinancialValue(a);
  const valB = parseFinancialValue(b);
  if (valA === null || valB === null) return false;
  return valA === valB;
}
