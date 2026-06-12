/**
 * Thai ID Card OCR text parser.
 * Extracts structured data from raw Tesseract output.
 * Pure function — no side effects, no data stored.
 */

export interface ParsedThaiIdCard {
  idNumber: string | null;
  fullNameTh: string | null;
  expiry: string | null;
}

/**
 * Parse raw OCR text from a Thai national ID card image.
 *
 * Handles:
 * - 13-digit citizen ID (with optional spaces/dashes between groups)
 * - Thai name with title prefix (นาย / นาง / นางสาว)
 * - Expiry date in Thai format (DD เดือน YYYY)
 */
export function parseThaiIdCard(text: string): ParsedThaiIdCard {
  // 1. 13-digit ID: X-XXXX-XXXXX-XX-X (with optional whitespace/dashes)
  const idMatch = text.match(/\d[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d/);
  const idNumber = idMatch?.[0].replace(/[\s-]/g, "") ?? null;

  // 2. Thai name: title + first name + last name
  const nameMatch = text.match(
    /(นาย|นาง(?:สาว)?)\s*([\u0E00-\u0E7F]+)\s+([\u0E00-\u0E7F]+)/,
  );
  const fullNameTh = nameMatch
    ? `${nameMatch[1]} ${nameMatch[2]} ${nameMatch[3]}`
    : null;

  // 3. Expiry date: DD + Thai month abbreviation + YYYY (Buddhist era)
  const expiryMatch = text.match(
    /(\d{1,2})\s+([\u0E00-\u0E7F]+\.?)\s+(\d{4})/g,
  );

  return {
    idNumber,
    fullNameTh,
    expiry: expiryMatch?.[0] ?? null,
  };
}
