import { Directive, ElementRef, HostListener, input } from '@angular/core';

/**
 * Directive that automatically replaces broken image sources with a placeholder image.
 * 
 * Usage:
 * <img src="image.jpg" appImageError />
 * 
 * When the image fails to load, it will automatically be replaced with the default placeholder
 * or a custom placeholder if provided via the input.
 */
@Directive({
  selector: 'img[appImageError]',
  standalone: true,
})
export class ImageErrorDirective {
  /**
   * Optional custom placeholder image path.
   * If not provided, defaults to 'http://localhost:4200/assets/images/image-placeholder.png'
   */
  placeholder = input<string>('http://localhost:4200/assets/images/image-placeholder.png');

  private defaultPlaceholder = 'http://localhost:4200/assets/images/image-placeholder.png';

  // Fallback to relative path if absolute URL fails
  private fallbackPlaceholder = '/assets/images/image-placeholder.png';
  private hasErrored = false;

  constructor(private elementRef: ElementRef<HTMLImageElement>) { }

  @HostListener('error', ['$event'])
  onError(event: Event): void {
    const img = this.elementRef.nativeElement;
    const currentSrc = img.src;

    // Prevent infinite loop if placeholder also fails to load
    if (this.hasErrored || currentSrc.includes('image-placeholder.png')) {
      return;
    }

    const placeholder = this.placeholder() || this.defaultPlaceholder;

    // Only replace if the current src is not already the placeholder
    if (currentSrc !== placeholder && !currentSrc.includes('image-placeholder.png')) {
      this.hasErrored = true;
      img.src = placeholder;

      // If the absolute URL fails, try the relative path as fallback
      img.onerror = () => {
        if (img.src === placeholder && !img.src.includes(this.fallbackPlaceholder)) {
          img.src = this.fallbackPlaceholder;
        }
      };
    }
  }

  @HostListener('load', ['$event'])
  onLoad(event: Event): void {
    // Reset error flag when image loads successfully
    this.hasErrored = false;
  }
}

