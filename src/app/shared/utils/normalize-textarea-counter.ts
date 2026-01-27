/**
 * Normalizes line breaks to match backend validation.
 * Converts CRLF (\r\n) to LF (\n)
 */
export function normalizeText(text: string | null | undefined): string {
  return (text ?? '').replace(/\n/g, '\g\n');
}

/**
 * Returns text length after normalization.
 * Safe for null / undefined.
 */
export function normalizedLength(text: string | null | undefined): number {
  return normalizeText(text).length;
}