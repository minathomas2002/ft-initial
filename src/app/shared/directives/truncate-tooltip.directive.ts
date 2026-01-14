import {
  Directive,
  ElementRef,
  input,
  effect,
  computed,
  inject,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appTruncateTooltip]',
  standalone: true
})
export class TruncateTooltipDirective {

  // Input signals
  appTruncateTooltip = input.required<string>();
  maxChars = input<number>(15);

  // Computed signals
  private readonly value = computed(() => this.appTruncateTooltip() ?? '');
  private readonly isTruncated = computed(() => this.value().length > this.maxChars());
  private readonly truncatedText = computed(() => {
    const val = this.value();
    const max = this.maxChars();
    return val.length > max ? val.slice(0, max) + '...' : val;
  });

  // Injected services
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  // Internal tooltip state
  private tooltipElement: HTMLElement | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private removeEnterListener: (() => void) | null = null;
  private removeLeaveListener: (() => void) | null = null;

  constructor() {
    // Setup element styles and text on initialization
    effect(() => {
      const element = this.el.nativeElement;

      // Apply truncation styles
      element.style.whiteSpace = 'nowrap';
      element.style.overflow = 'hidden';
      element.style.textOverflow = 'ellipsis';

      // Update text content reactively
      element.textContent = this.truncatedText();

      // Manage tooltip creation based on truncation
      if (this.isTruncated()) {
        this.setupTooltip();
      } else {
        this.cleanupTooltip();
      }
    });
  }

  private setupTooltip(): void {
    const element = this.el.nativeElement;
    const value = this.value();

    // If tooltip already exists, just update its text
    if (this.tooltipElement) {
      this.renderer.setProperty(this.tooltipElement.querySelector('.p-tooltip-text'), 'textContent', value);
      return;
    }

    // Create tooltip container
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'p-tooltip');
    this.renderer.addClass(this.tooltipElement, 'p-component');
    this.renderer.addClass(this.tooltipElement, 'p-tooltip-top'); // always top

    const tooltipText = this.renderer.createElement('div');
    this.renderer.addClass(tooltipText, 'p-tooltip-text');
    this.renderer.setProperty(tooltipText, 'textContent', value);
    this.renderer.appendChild(this.tooltipElement, tooltipText);

    // Append to body
    this.renderer.appendChild(document.body, this.tooltipElement);
    this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');

    // Add listeners
    this.removeEnterListener = this.renderer.listen(element, 'mouseenter', () => this.showTooltip(element));
    this.removeLeaveListener = this.renderer.listen(element, 'mouseleave', () => this.hideTooltip());
  }

  private showTooltip(targetElement: HTMLElement): void {
    if (!this.tooltipElement) return;

    this.clearTimeout(this.hideTimeout);
    this.hideTimeout = null;

    this.showTimeout = setTimeout(() => {
      if (!this.tooltipElement) return;

      const rect = targetElement.getBoundingClientRect();
      const gap = 10;

      // Temporarily show tooltip to measure its dimensions
      this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');
      this.renderer.setStyle(this.tooltipElement, 'display', 'block');
      const tooltipRect = this.tooltipElement.getBoundingClientRect();

      // Calculate position: top (above element) and centered horizontally
      const top = rect.top - tooltipRect.height - gap;
      const elementCenterX = rect.left + rect.width / 2;
      const tooltipCenterX = tooltipRect.width / 2;
      const left = elementCenterX - tooltipCenterX;

      // Apply position with scroll offset
      this.renderer.setStyle(this.tooltipElement, 'top', `${top + window.scrollY}px`);
      this.renderer.setStyle(this.tooltipElement, 'left', `${left + window.scrollX}px`);
      this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');
    }, 100);
  }

  private hideTooltip(): void {
    if (!this.tooltipElement) return;

    this.clearTimeout(this.showTimeout);
    this.showTimeout = null;

    this.hideTimeout = setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.setStyle(this.tooltipElement, 'display', 'none');
      }
    }, 0);
  }

  private cleanupTooltip(): void {
    this.clearTimeout(this.showTimeout);
    this.clearTimeout(this.hideTimeout);
    this.showTimeout = null;
    this.hideTimeout = null;

    if (this.removeEnterListener) {
      this.removeEnterListener();
      this.removeEnterListener = null;
    }
    if (this.removeLeaveListener) {
      this.removeLeaveListener();
      this.removeLeaveListener = null;
    }

    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  private clearTimeout(timeout: ReturnType<typeof setTimeout> | null): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
  }
}