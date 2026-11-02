/**
 * Clean OCR / copy-paste artefacts from text.
 *
 * Handles:
 *  - Hyphenated line-break word splits:  "Tay- \n lor" → "Taylor"
 *  - Runs of whitespace / newlines       → single space
 */
export function cleanText(s: string): string {
  return s
    .replace(/-\s*\n\s*/g, '')   // rejoin hyphenated words split across lines
    .replace(/\s+/g, ' ')         // collapse all remaining whitespace
    .trim();
}
