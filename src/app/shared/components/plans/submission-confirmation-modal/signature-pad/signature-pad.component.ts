import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-signature-pad',
  imports: [ButtonModule],
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

  constructor() {
    effect(() => {
      const existing = this.existingSignature();
      if (existing) {
        this.currentSignature.set(existing);
        this.showCanvas.set(false);
      } else {
        this.showCanvas.set(true);
        this.currentSignature.set(null);
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }

    // Set canvas size based on container
    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.min(600, rect.width - 32);
      canvas.height = 200;
    }

    // Load existing signature if available
    const existing = this.existingSignature();
    if (existing) {
      this.loadSignature(existing);
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.ctx) return;
    this.isDrawing.set(true);
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing() || !this.ctx) return;
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
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
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.isDrawing() || !this.ctx) return;
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
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
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.currentSignature.set(null);
      this.onSignatureChange.emit(null);
    }
  }

  changeSignature(): void {
    this.showCanvas.set(true);
    this.clearSignature();
  }

  private saveSignature(): void {
    const canvas = this.canvasRef().nativeElement;
    // Check if canvas has any content
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
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };
    img.src = dataUrl;
  }
}
