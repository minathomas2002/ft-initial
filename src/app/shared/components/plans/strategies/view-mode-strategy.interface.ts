/**
 * Strategy interface for handling view mode-specific logic
 * Uses Strategy pattern to encapsulate mode behavior
 */
export interface IViewModeStrategy {
  /**
   * Check if editing is allowed in this mode
   */
  canEdit(): boolean;

  /**
   * Check if submitting is allowed in this mode
   */
  canSubmit(): boolean;

  /**
   * Check if commenting is allowed in this mode
   */
  canComment(): boolean;

  /**
   * Check if comments should be shown in this mode
   */
  shouldShowComments(): boolean;

  /**
   * Get form state for this mode ('enabled' | 'disabled' | 'readonly')
   */
  getFormState(): 'enabled' | 'disabled' | 'readonly';
}