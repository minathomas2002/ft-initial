/**
 * Creates a unique inputKey for value chain form fields.
 * Format: sectionKey_controlName_index (e.g. designEngineering_expenseHeader_0)
 * Ensures each field has a globally unique identifier for comments and highlighting.
 */
export function createValueChainFieldKey(sectionKey: string, controlName: string, index: number): string {
  return `${sectionKey}_${controlName}_${index}`;
}

/**
 * Extracts the raw form control name from a value chain unique inputKey.
 * Handles format: sectionKey_controlName_index
 * Returns the control name for form lookups (e.g. expenseHeader, inHouseOrProcured, year1).
 * Falls back to inputKey as-is if it doesn't match the expected format (e.g. from API).
 */
export function extractValueChainControlName(inputKey: string): string {
  const match = inputKey.match(/^[a-zA-Z]+_([a-zA-Z0-9]+)_\d+$/);
  return match ? match[1] : inputKey;
}

/**
 * Extracts the row index from a value chain unique inputKey.
 * Handles format: sectionKey_controlName_index
 * Returns the index for form array lookups, or -1 if not in that format.
 */
export function extractValueChainIndex(inputKey: string): number {
  const match = inputKey.match(/^[a-zA-Z]+_[a-zA-Z0-9]+_(\d+)$/);
  return match ? parseInt(match[1], 10) : -1;
}
