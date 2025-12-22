import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-signature-pad',
  imports: [ButtonModule, TranslatePipe],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignaturePadComponent implements AfterViewInit {
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  existingSignature = input<string | null>(null);
  onSignatureChange = output<string | null>();

  private isDrawing = signal(false);
  private ctx: CanvasRenderingContext2D | null = null;
  showCanvas = signal(false);
  currentSignature = signal<string | null>(null);
  private isInitializing = false;
  private initRetryCount = 0;
  private readonly MAX_RETRIES = 10;
  private viewInitialized = false;

  constructor() {
    effect(() => {
      const existing = this.existingSignature();
      if (existing) {
        this.currentSignature.set(existing);
        this.showCanvas.set(false);
      } else {
        this.showCanvas.set(true);
        this.currentSignature.set(null);
        // Only reinitialize if view is ready and canvas is visible
        if (this.viewInitialized && this.showCanvas()) {
          this.scheduleInitialization();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    // Use requestAnimationFrame to ensure canvas is fully rendered
    requestAnimationFrame(() => {
      this.initializeCanvas();
    });
  }

  private scheduleInitialization(): void {
    if (!this.isInitializing) {
      requestAnimationFrame(() => {
        this.initializeCanvas();
      });
    }
  }

  private initializeCanvas(): void {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      return;
    }

    try {
      const canvas = this.canvasRef().nativeElement;
      if (!canvas || !this.showCanvas()) {
        return;
      }

      this.isInitializing = true;

      // Use getBoundingClientRect to get the actual displayed size
      // This matches what we'll use for coordinate calculations
      const rect = canvas.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;

      if (displayWidth === 0 || displayHeight === 0) {
        // Canvas not yet rendered, try again with retry limit
        this.initRetryCount++;
        if (this.initRetryCount < this.MAX_RETRIES) {
          requestAnimationFrame(() => {
            this.isInitializing = false;
            this.initializeCanvas();
          });
        } else {
          console.warn('Canvas initialization failed after maximum retries');
          this.isInitializing = false;
          this.initRetryCount = 0;
        }
        return;
      }

      // Reset retry counter on success
      this.initRetryCount = 0;

      // Set internal canvas size to exactly match display size
      // This ensures 1:1 coordinate mapping (no scaling needed)
      canvas.width = Math.floor(displayWidth);
      canvas.height = Math.floor(displayHeight);

      this.ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!this.ctx) {
        this.isInitializing = false;
        return;
      }

      // Set drawing styles
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // Load existing signature if available
      const existing = this.existingSignature();
      if (existing) {
        this.loadSignature(existing);
      }

      this.isInitializing = false;
    } catch (error) {
      console.error('Error initializing canvas:', error);
      this.isInitializing = false;
      this.initRetryCount = 0;
    }
  }

  private getCanvasCoordinates(event: MouseEvent | Touch): { x: number; y: number } {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();

    // Get client coordinates (works for both MouseEvent and Touch)
    const clientX = event.clientX;
    const clientY = event.clientY;

    // Calculate coordinates relative to canvas top-left corner
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Scale coordinates to match canvas internal dimensions
    // This accounts for any difference between display size and internal size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    return { x, y };
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.ctx) return;
    event.preventDefault();
    this.isDrawing.set(true);
    const { x, y } = this.getCanvasCoordinates(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing() || !this.ctx) return;
    event.preventDefault();
    const { x, y } = this.getCanvasCoordinates(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  onMouseUp(): void {
    if (this.isDrawing()) {
      this.isDrawing.set(false);
      this.saveSignature();
    }
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (!this.ctx) return;
    this.isDrawing.set(true);
    const touch = event.touches[0];
    const { x, y } = this.getCanvasCoordinates(touch);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.isDrawing() || !this.ctx) return;
    const touch = event.touches[0];
    const { x, y } = this.getCanvasCoordinates(touch);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  onTouchEnd(): void {
    if (this.isDrawing()) {
      this.isDrawing.set(false);
      this.saveSignature();
    }
  }

  clearSignature(): void {
    const canvas = this.canvasRef().nativeElement;
    if (this.ctx) {
      // Clear using canvas internal dimensions
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.currentSignature.set(null);
      this.onSignatureChange.emit(null);
    }
  }

  changeSignature(): void {
    this.showCanvas.set(true);
    // Reinitialize canvas when it becomes visible
    this.scheduleInitialization();
  }

  private saveSignature(): void {
    const canvas = this.canvasRef().nativeElement;
    // Check if canvas has any content
    // Use internal canvas dimensions for getImageData
    const imageData = this.ctx?.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData?.data.some((value, index) => {
      // Check alpha channel (every 4th value starting from index 3)
      if (index % 4 === 3) {
        return value > 0;
      }
      return false;
    });

    if (hasContent) {
      const dataUrl = canvas.toDataURL('image/png');
      this.currentSignature.set(dataUrl);
      this.onSignatureChange.emit(dataUrl);
    } else {
      this.currentSignature.set(null);
      this.onSignatureChange.emit(null);
    }
  }

  private loadSignature(dataUrl: string): void {
    const canvas = this.canvasRef().nativeElement;
    const img = new Image();
    img.onload = () => {
      if (this.ctx) {
        // Clear and draw using canvas internal dimensions
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };
    img.src = dataUrl;
  }
}
