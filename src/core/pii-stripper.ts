// ============================================================
// PII Stripper — Deep removal of personal data before TEE transit
// ============================================================

import type { CitizenProfile } from "./state-token";

/**
 * Fields that are ALWAYS stripped before sending to TEE.
 * Even if the TEE is trusted, defense-in-depth says minimize exposure.
 */
const PII_FIELDS: (keyof CitizenProfile)[] = [
  "applicantName",
  "fatherName",
  "motherName",
  "dateOfBirth",
  "mobileNumber",
  "email",
  "bankAccountLast4",
  "bankName",
  "ifscCode",
  "applicationId",
];

/**
 * Regex patterns for detecting PII in free-text fields
 */
const PII_PATTERNS: { name: string; pattern: RegExp; replacement: string }[] = [
  {
    name: "aadhaar",
    pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    replacement: "[AADHAAR_REDACTED]",
  },
  {
    name: "phone_india",
    pattern: /\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g,
    replacement: "[PHONE_REDACTED]",
  },
  {
    name: "email",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[EMAIL_REDACTED]",
  },
  {
    name: "pan",
    pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    replacement: "[PAN_REDACTED]",
  },
  {
    name: "bank_account",
    pattern: /\b\d{9,18}\b/g,
    replacement: "[ACCOUNT_REDACTED]",
  },
  {
    name: "ifsc",
    pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    replacement: "[IFSC_REDACTED]",
  },
];

/**
 * Strip PII fields from a citizen profile.
 * Returns a new object with PII fields removed/replaced.
 */
export function stripProfilePII(
  profile: CitizenProfile
): Partial<CitizenProfile> {
  const stripped: Record<string, unknown> = { ...profile };

  // Remove known PII fields
  for (const field of PII_FIELDS) {
    delete stripped[field];
  }

  // Replace with anonymized placeholders for fields the TEE needs context on
  stripped.applicantName = "[REDACTED]";
  stripped.dateOfBirth = "[REDACTED]";

  return stripped as Partial<CitizenProfile>;
}

/**
 * Deep-strip PII from any arbitrary payload object.
 * Recursively walks the object tree and applies PII regex patterns
 * to all string values.
 */
export function deepStripPII<T>(payload: T): T {
  if (payload === null || payload === undefined) return payload;

  if (typeof payload === "string") {
    return redactString(payload) as unknown as T;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => deepStripPII(item)) as unknown as T;
  }

  if (typeof payload === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      // Skip known PII field names entirely
      if (PII_FIELDS.includes(key as keyof CitizenProfile)) {
        result[key] = "[REDACTED]";
        continue;
      }
      result[key] = deepStripPII(value);
    }
    return result as T;
  }

  return payload;
}

/**
 * Apply all PII regex patterns to a string.
 */
function redactString(input: string): string {
  let result = input;
  for (const { pattern, replacement } of PII_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
