import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, OnDestroy, output, signal, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-signature-pad',
  imports: [ButtonModule, TranslatePipe],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignaturePadComponent implements AfterViewInit, OnDestroy {
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  existingSignature = input<string | null>(null);
  onSignatureChange = output<string | null>();

  private isDrawing = signal(false);
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasInitialized = signal(false);
  showCanvas = signal(false);
  currentSignature = signal<string | null>(null);
  private isInitializing = false;
  private initRetryCount = 0;
  private readonly MAX_RETRIES = 10;
  private viewInitialized = false;
  private documentMouseMoveHandler?: (e: MouseEvent) => void;
  private documentMouseUpHandler?: () => void;

  // Computed signal to check if clear button should be enabled
  canClearSignature = computed(() => {
    // Enable clear button if:
    // 1. There's a current signature, OR
    // 2. Canvas is visible and initialized - meaning user can draw/clear
    return !!(this.currentSignature() || (this.showCanvas() && this.canvasInitialized()));
  });


  constructor() {
    effect(() => {
      const existing = this.existingSignature();
      // Only update if showCanvas is false (meaning we're showing the existing signature)
      // This prevents the effect from interfering when user clicks "Change"
      if (existing && !this.showCanvas()) {
        this.currentSignature.set(existing);
        this.showCanvas.set(false);
        // Emit the existing signature to update the form control
        this.onSignatureChange.emit(existing);
      } else if (!existing && !this.showCanvas()) {
        // When existing signature is cleared from parent, reset the signature pad
        this.showCanvas.set(true);
        this.currentSignature.set(null);
        this.onSignatureChange.emit(null);
        // Clear the canvas if context is available
        if (this.ctx) {
          try {
            const canvasRef = this.canvasRef();
            if (canvasRef) {
              const canvas = canvasRef.nativeElement;
              this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          } catch (error) {
            // Canvas might not be initialized yet, ignore error
          }
        }
        this.canvasInitialized.set(false);
        // Only reinitialize if view is ready and canvas is visible
        if (this.viewInitialized && this.showCanvas()) {
          // Reset retry count when showing canvas again
          this.initRetryCount = 0;
          this.scheduleInitialization();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;

    // Emit existing signature if present (ensures form control is updated when modal opens)
    const existing = this.existingSignature();
    if (existing) {
      // Use setTimeout to ensure the output is connected
      setTimeout(() => {
        this.onSignatureChange.emit(existing);
      }, 0);
    }

    // Only initialize canvas if it's visible (showCanvas is true)
    if (this.showCanvas()) {
      // Use requestAnimationFrame to ensure canvas is fully rendered
      requestAnimationFrame(() => {
        this.initializeCanvas();
      });
    }
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

    // Check if canvas is visible before initializing
    if (!this.showCanvas()) {
      return;
    }

    try {
      const canvasRef = this.canvasRef();
      if (!canvasRef) {
        // Canvas not yet available, retry if within limit
        this.initRetryCount++;
        if (this.initRetryCount < this.MAX_RETRIES) {
          requestAnimationFrame(() => {
            this.isInitializing = false;
            this.initializeCanvas();
          });
        }
        return;
      }

      const canvas = canvasRef.nativeElement;
      if (!canvas) {
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
        this.canvasInitialized.set(false);
        return;
      }

      // Set drawing styles
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // Clear the canvas when initializing after changeSignature()
      // This ensures a fresh canvas when switching from existing signature to drawing mode
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Load existing signature if available
      // When changeSignature() is called, currentSignature is set to the existing signature
      // so we load it onto the canvas for editing
      const existing = this.existingSignature();
      const currentSig = this.currentSignature();

      // Load signature if we have one (either from existingSignature input or currentSignature)
      // This allows the user to modify the existing signature when they click "Change"
      const signatureToLoad = currentSig || existing;
      if (signatureToLoad) {
        this.loadSignature(signatureToLoad);
        // Ensure currentSignature is set so the clear button works
        if (!this.currentSignature()) {
          this.currentSignature.set(signatureToLoad);
        }
      }

      // Mark canvas as initialized
      this.canvasInitialized.set(true);

      this.isInitializing = false;
    } catch (error) {
      console.error('Error initializing canvas:', error);
      this.isInitializing = false;
      this.initRetryCount = 0;
    }
  }

  private getCanvasCoordinates(event: MouseEvent | Touch): { x: number; y: number } | null {
    try {
      const canvasRef = this.canvasRef();
      if (!canvasRef) return null;
      const canvas = canvasRef.nativeElement;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      // Get client coordinates (works for both MouseEvent and Touch)
      const clientX = event.clientX;
      const clientY = event.clientY;

      // Calculate coordinates relative to canvas top-left corner
      let x = clientX - rect.left;
      let y = clientY - rect.top;

      // Clamp coordinates to canvas bounds (important when using document-level listeners)
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      // Scale coordinates to match canvas internal dimensions
      // This accounts for any difference between display size and internal size
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      x *= scaleX;
      y *= scaleY;

      return { x, y };
    } catch (error) {
      console.error('Error getting canvas coordinates:', error);
      return null;
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.ctx) {
      // Try to initialize if context is not available
      this.initializeCanvas();
      if (!this.ctx) return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.isDrawing.set(true);
    const coords = this.getCanvasCoordinates(event);
    if (coords) {
      this.ctx.beginPath();
      this.ctx.moveTo(coords.x, coords.y);
    }

    // Add document-level listeners to handle mouse movement outside canvas
    this.documentMouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
    this.documentMouseUpHandler = () => this.onMouseUp();
    document.addEventListener('mousemove', this.documentMouseMoveHandler);
    document.addEventListener('mouseup', this.documentMouseUpHandler);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing() || !this.ctx) return;
    event.preventDefault();
    event.stopPropagation();
    const coords = this.getCanvasCoordinates(event);
    if (coords) {
      this.ctx.lineTo(coords.x, coords.y);
      this.ctx.stroke();
    }
  }

  onMouseUp(): void {
    if (this.isDrawing()) {
      this.isDrawing.set(false);
      this.saveSignature();
    }
    // Remove document-level listeners
    if (this.documentMouseMoveHandler) {
      document.removeEventListener('mousemove', this.documentMouseMoveHandler);
      this.documentMouseMoveHandler = undefined;
    }
    if (this.documentMouseUpHandler) {
      document.removeEventListener('mouseup', this.documentMouseUpHandler);
      this.documentMouseUpHandler = undefined;
    }
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.ctx) {
      // Try to initialize if context is not available
      this.initializeCanvas();
      if (!this.ctx) return;
    }
    this.isDrawing.set(true);
    const touch = event.touches[0];
    if (touch) {
      const coords = this.getCanvasCoordinates(touch);
      if (coords) {
        this.ctx.beginPath();
        this.ctx.moveTo(coords.x, coords.y);
      }
    }
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isDrawing() || !this.ctx) return;
    const touch = event.touches[0];
    if (touch) {
      const coords = this.getCanvasCoordinates(touch);
      if (coords) {
        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.stroke();
      }
    }
  }

  onTouchEnd(): void {
    if (this.isDrawing()) {
      this.isDrawing.set(false);
      this.saveSignature();
    }
  }

  clearSignature(): void {
    const canvasRef = this.canvasRef();
    if (!canvasRef) return;

    // Clear the canvas if context is available
    if (this.ctx) {
      const canvas = canvasRef.nativeElement;
      // Clear using canvas internal dimensions
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Clear the signature state and emit null
    this.currentSignature.set(null);
    this.onSignatureChange.emit(null);
  }

  changeSignature(): void {
    // Get the existing signature before clearing state
    const existingSig = this.existingSignature();

    // Reset canvas initialization state
    this.canvasInitialized.set(false);

    // Show canvas for drawing/modifying signature
    // Note: canvasRef() and ctx will be null/undefined here because the canvas
    // isn't rendered yet. It will be initialized after Angular renders the canvas.
    this.showCanvas.set(true);

    // Set currentSignature to the existing signature so it can be loaded onto canvas
    // This allows the user to modify the existing signature
    if (existingSig) {
      this.currentSignature.set(existingSig);
    } else {
      this.currentSignature.set(null);
    }

    // Reinitialize canvas when it becomes visible
    // The canvas will be rendered by Angular after showCanvas is set to true,
    // then initializeCanvas() will be called via scheduleInitialization()
    // and it will load the existing signature onto the canvas
    this.scheduleInitialization();
  }

  resetSignature(): void {
    this.currentSignature.set(null);
    this.showCanvas.set(true);
    // Clear the canvas if context is available
    const canvasRef = this.canvasRef();
    if (this.ctx && canvasRef) {
      const canvas = canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.onSignatureChange.emit(null);
  }

  private saveSignature(): void {
    const canvasRef = this.canvasRef();
    if (!canvasRef || !this.ctx) return;
    const canvas = canvasRef.nativeElement;
    // Check if canvas has any content
    // Use internal canvas dimensions for getImageData
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
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
    const canvasRef = this.canvasRef();
    if (!canvasRef || !this.ctx) return;
    const canvas = canvasRef.nativeElement;
    const img = new Image();
    img.onload = () => {
      if (this.ctx) {
        // Clear and draw using canvas internal dimensions
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Update currentSignature so the clear button works
        this.currentSignature.set(dataUrl);
        // Emit the signature to update the form control
        this.onSignatureChange.emit(dataUrl);
      }
    };
    img.src = dataUrl;
  }

  ngOnDestroy(): void {
    // Clean up document-level event listeners
    if (this.documentMouseMoveHandler) {
      document.removeEventListener('mousemove', this.documentMouseMoveHandler);
    }
    if (this.documentMouseUpHandler) {
      document.removeEventListener('mouseup', this.documentMouseUpHandler);
    }
    this.clearSignature();
  }
}
