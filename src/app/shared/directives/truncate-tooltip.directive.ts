import {
  Directive,
  ElementRef,
  input,
  effect,
  computed,
  inject,
  signal,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appTruncateTooltip]',
  standalone: true
})
export class TruncateTooltipDirective {

  // Input signals
  appTruncateTooltip = input.required<string>();
  maxChars = input<number>(0);
  /** Max height in pixels. When set, content exceeding this height is hidden and tooltip shows full text on hover. */
  maxHeight = input<number | string>(0);

  // Computed signals
  private readonly value = computed(() => this.appTruncateTooltip() ?? '');
  private readonly useHeightTruncation = computed(() => {
    const mh = this.maxHeight();
    return mh !== 0 && mh !== '0' && mh !== '';
  });
  private readonly isCharTruncated = computed(() => this.value().length > this.maxChars());
  private readonly truncatedText = computed(() => {
    if (this.maxChars() === 0) return this.value();
    const val = this.value();
    const max = this.maxChars();
    return val.length > max ? val.slice(0, max) + '...' : val;
  });

  /** Set after measuring DOM when using maxHeight truncation */
  private readonly isHeightTruncated = signal(false);

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
      const useHeight = this.useHeightTruncation();
      const maxHeightVal = this.maxHeight();
      const textAlign = this.getTextAlignByLanguage(this.value());

      // Keep rendered text aligned by content language
      // this.renderer.setStyle(element, 'textAlign', textAlign);

      // Reset height truncation state when not using it
      if (!useHeight) {
        this.isHeightTruncated.set(false);
      }

      if (useHeight) {
        // Height-based truncation: full text, max-height, overflow hidden, ellipsis
        element.textContent = this.value();
        const heightCss = typeof maxHeightVal === 'number' ? `${maxHeightVal}px` : String(maxHeightVal);
        this.renderer.setStyle(element, 'maxHeight', heightCss);
        this.renderer.setStyle(element, 'overflow', 'hidden');
        this.renderer.setStyle(element, 'textOverflow', 'ellipsis');
        this.renderer.setStyle(element, 'display', '-webkit-box');
        this.renderer.setStyle(element, '-webkit-box-orient', 'vertical');
        const lineClamp = this.getLineClamp(element, maxHeightVal);
        this.renderer.setStyle(element, '-webkit-line-clamp', String(lineClamp));

        // Measure after layout to detect overflow
        this.measureHeightOverflow(element);
      } else {
        // Char-based truncation (existing behavior)
        this.renderer.setStyle(element, 'maxHeight', null);
        this.renderer.setStyle(element, 'overflow', 'hidden');
        this.renderer.setStyle(element, 'textOverflow', 'ellipsis');
        this.renderer.setStyle(element, 'display', null);
        this.renderer.setStyle(element, '-webkit-box-orient', null);
        this.renderer.setStyle(element, '-webkit-line-clamp', null);

        element.textContent = this.truncatedText();

        if (this.isCharTruncated()) {
          this.setupTooltip();
        } else {
          this.cleanupTooltip();
        }
      }
    });

    // React to isHeightTruncated for tooltip when using height truncation
    effect(() => {
      if (this.useHeightTruncation() && this.isHeightTruncated()) {
        this.setupTooltip();
      } else if (this.useHeightTruncation() && !this.isHeightTruncated()) {
        this.cleanupTooltip();
      }
    });
  }

  private getLineClamp(element: HTMLElement, maxHeight: number | string): number {
    if (typeof maxHeight === 'number') {
      const lineHeightPx = parseFloat(getComputedStyle(element).lineHeight);
      const lineHeight = Number.isNaN(lineHeightPx) || lineHeightPx <= 0 ? 20 : lineHeightPx;
      return Math.max(1, Math.floor(maxHeight / lineHeight));
    }
    return 3;
  }

  private measureHeightOverflow(element: HTMLElement): void {
    const check = (): void => {
      const overflowed = element.scrollHeight > element.clientHeight;
      this.isHeightTruncated.set(overflowed);
    };
    // Defer measurement to after layout
    requestAnimationFrame(() => requestAnimationFrame(check));
  }

  private setupTooltip(): void {
    const element = this.el.nativeElement;
    const value = this.value();
    const textAlign = this.getTextAlignByLanguage(value);

    // If tooltip already exists, just update its text
    if (this.tooltipElement) {
      this.renderer.setProperty(this.tooltipElement.querySelector('.p-tooltip-text'), 'textContent', value);
      this.renderer.setStyle(this.tooltipElement.querySelector('.p-tooltip-text'), 'textAlign', textAlign);
      return;
    }

    // Create tooltip container
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'p-tooltip');
    this.renderer.addClass(this.tooltipElement, 'p-component');
    this.renderer.addClass(this.tooltipElement, 'p-tooltip-top'); // always top

    const tooltipText = this.renderer.createElement('div');
    this.renderer.addClass(tooltipText, 'p-tooltip-text');
    this.renderer.setStyle(tooltipText, 'textAlign', textAlign);
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

  private getTextAlignByLanguage(value: string): 'right' | 'left' {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0700-\u074F\u0780-\u07BF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    const ltrRegex = /[A-Za-z\u00C0-\u024F]/g;

    const rtlCount = (value.match(rtlRegex) || []).length;
    const ltrCount = (value.match(ltrRegex) || []).length;

    if (rtlCount === 0 && ltrCount === 0) return 'left'; // numbers/symbols only → default
    return rtlCount >= ltrCount ? 'right' : 'left';
  }
}
