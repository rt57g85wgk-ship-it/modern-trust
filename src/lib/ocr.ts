/**
 * Thai ID Card OCR text parser.
 * Extracts structured data from raw Tesseract output.
 * Pure function — no side effects, no data stored.
 *
 * Uses multiple fallback strategies because Tesseract often
 * garbles Thai title prefixes (นาย/นาง → "UN", "นน", etc.).
 */

export interface ParsedThaiIdCard {
  idNumber: string | null;
  fullNameTh: string | null;
  fullNameEn: string | null;
  expiry: string | null;
}

/** Known English title prefixes on Thai ID cards */
const EN_TITLES = /\b(Mr\.|Mrs\.|Miss|Ms\.)\s*/i;

/** Thai title prefixes */
const TH_TITLES = /(นาย|นาง(?:สาว)?)/;

/** Two or more consecutive Thai characters */
const THAI_WORD = /[\u0E00-\u0E7F]{2,}/g;

/**
 * Parse raw OCR text from a Thai national ID card image.
 */
export function parseThaiIdCard(text: string): ParsedThaiIdCard {
  // Normalise whitespace (OCR sometimes inserts weird spaces)
  const clean = text.replace(/\r/g, "");

  // ── 1. ID Number (13 digits) ──────────────────────────────────
  // Pattern: X XXXX XXXXX XX X  (with optional spaces/dashes)
  // Also allow wider gaps that OCR sometimes introduces
  const idMatch = clean.match(
    /(\d)\s*[-.]?\s*(\d{4})\s*[-.]?\s*(\d{5})\s*[-.]?\s*(\d{2})\s*[-.]?\s*(\d)/,
  );
  const idNumber = idMatch
    ? `${idMatch[1]}${idMatch[2]}${idMatch[3]}${idMatch[4]}${idMatch[5]}`
    : null;

  // Validate it's exactly 13 digits
  const validId = idNumber && idNumber.length === 13 ? idNumber : null;

  // ── 2. Thai Name ──────────────────────────────────────────────
  const fullNameTh = extractThaiName(clean);

  // ── 3. English Name ───────────────────────────────────────────
  const fullNameEn = extractEnglishName(clean);

  // ── 4. Expiry Date ────────────────────────────────────────────
  const expiry = extractExpiry(clean);

  return {
    idNumber: validId,
    fullNameTh,
    fullNameEn,
    expiry,
  };
}

/**
 * Extract Thai name using multiple strategies:
 * 1. Direct title match (นาย/นาง/นางสาว + Thai words)
 * 2. Contextual anchor: grab Thai words from the "ชื่อตัว" line
 * 3. Grab Thai words from the line above the English "Name" line
 */
function extractThaiName(text: string): string | null {
  // Strategy 1: Title prefix present and readable
  const titleMatch = text.match(
    new RegExp(
      `${TH_TITLES.source}\\s*([\\u0E00-\\u0E7F]{2,})\\s+([\\u0E00-\\u0E7F]{2,})`,
    ),
  );
  if (titleMatch) {
    return `${titleMatch[1]} ${titleMatch[2]} ${titleMatch[3]}`;
  }

  // Strategy 2: Find the line containing "ชื่อตัว" (name label on card)
  // and extract Thai words from it — skip the label itself
  const lines = text.split("\n");
  for (const line of lines) {
    if (/ชื่อตัว/.test(line) || /ชื่อเก/.test(line)) {
      // Grab all Thai words from this line
      const words = line.match(THAI_WORD) || [];
      // Filter out label words
      const labelWords = [
        "ชื่อตัว", "ชื่อเก", "และ", "ชื่อสกุล",
        "ชื่อตัวและชื่อสกุล", "บัตร", "ประจำ", "ประชาชน",
      ];
      const nameWords = words.filter(
        (w) => !labelWords.some((lbl) => w.includes(lbl)) && w.length >= 2,
      );
      if (nameWords.length >= 2) {
        return nameWords.join(" ");
      }
      if (nameWords.length === 1) {
        // Check next line for last name
        const idx = lines.indexOf(line);
        if (idx + 1 < lines.length) {
          const nextWords = lines[idx + 1].match(THAI_WORD) || [];
          const nextName = nextWords.filter((w) => w.length >= 2);
          if (nextName.length > 0) {
            return `${nameWords[0]} ${nextName[0]}`;
          }
        }
        return nameWords[0];
      }
    }
  }

  // Strategy 3: Use English name line to locate Thai names nearby
  for (let i = 0; i < lines.length; i++) {
    if (/\bName\b/i.test(lines[i]) && !/Last/i.test(lines[i])) {
      // Check the line above for Thai words
      if (i > 0) {
        const above = lines[i - 1].match(THAI_WORD) || [];
        const nameAbove = above.filter((w) => w.length >= 2);
        if (nameAbove.length >= 2) {
          return nameAbove.slice(-2).join(" ");
        }
      }
    }
  }

  return null;
}

/**
 * Extract English name from the card.
 * Lines like: "Name Mrs. Bunyang" / "Last name Lopez"
 */
function extractEnglishName(text: string): string | null {
  const lines = text.split("\n");
  let firstName = "";
  let lastName = "";

  for (const line of lines) {
    // Match "Name Mr./Mrs./Miss FirstName" but NOT "Last name"
    if (/^\s*Name\b/i.test(line) && !/Last/i.test(line)) {
      const cleaned = line
        .replace(/^\s*Name\s*/i, "")
        .replace(EN_TITLES, "")
        .trim();
      const latin = cleaned.match(/[A-Za-z]+/g);
      if (latin) firstName = latin.join(" ");
    }
    // Match "Last name Lopez"
    if (/Last\s*name/i.test(line)) {
      const cleaned = line.replace(/Last\s*name\s*/i, "").trim();
      const latin = cleaned.match(/[A-Za-z]+/g);
      if (latin) lastName = latin.join(" ");
    }
  }

  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(" ");
  }
  return null;
}

/**
 * Extract expiry date.
 * Cards show: "วันบัตรหมดอายุ DD เดือน YYYY"
 * Also handles garbled "หมดอาย" label or just picks the last date on card.
 */
function extractExpiry(text: string): string | null {
  const lines = text.split("\n");

  // Strategy 1: Find line with "หมดอาย" (expiry label, often garbled)
  for (const line of lines) {
    if (/หมดอาย/.test(line)) {
      const dateMatch = line.match(
        /(\d{1,2})\s+([\u0E00-\u0E7F]+\.?)\s+(\d{4})/,
      );
      if (dateMatch) return dateMatch[0];
    }
  }

  // Strategy 2: All dates → take the last one (expiry is always last on card)
  const allDates = text.match(
    /(\d{1,2})\s+([\u0E00-\u0E7F]+\.?)\s+(\d{4})/g,
  );
  if (allDates && allDates.length > 0) {
    return allDates[allDates.length - 1];
  }

  return null;
}
