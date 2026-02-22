import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnChanges,
  OnDestroy,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { Button } from "primeng/button";

@Component({
  selector: 'app-reset-button',
  imports: [Button],
  templateUrl: './reset-button.html',
  styleUrl: './reset-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetButton {
  title = input('');
  buttonLabel = input('');
  disabled = input(false);
  isLoading = input(false);
  successToken = input(0);

  resend = output();

  private readonly countdownSeconds = signal(0);
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  readonly buttonText = computed(() => {
    const seconds = this.countdownSeconds();
    return seconds > 0 ? `${this.buttonLabel()} (${seconds}s)` : this.buttonLabel();
  });

  constructor() {
    effect(() => {
      if (this.successToken()) {
        this.startCountdown();
      }
    })
  }

  isButtonDisabled(): boolean {
    return this.disabled() || this.isLoading() || this.countdownSeconds() > 0;
  }

  onResendClick(): void {
    if (this.isButtonDisabled()) {
      return;
    }

    this.resend.emit();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private startCountdown(durationInSeconds = 60): void {
    this.clearTimer();
    this.countdownSeconds.set(durationInSeconds);

    this.countdownTimer = setInterval(() => {
      const next = this.countdownSeconds() - 1;

      if (next <= 0) {
        this.countdownSeconds.set(0);
        this.clearTimer();
        return;
      }

      this.countdownSeconds.set(next);
    }, 1000);
  }

  private clearTimer(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
