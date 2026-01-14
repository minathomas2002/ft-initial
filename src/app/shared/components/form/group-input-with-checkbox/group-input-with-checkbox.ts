import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { distinctUntilChanged, debounceTime } from 'rxjs';

@Component({
  selector: 'app-group-input-with-checkbox',
  imports: [CheckboxModule, ReactiveFormsModule],
  styleUrl: './group-input-with-checkbox.scss',
  template: `
    <div class="flex items-center gap-2">
      @if (showCheckbox() && hasCommentControl()) {
        <p-checkbox
          [formControl]="hasCommentControl()!"
          [binary]="true"
          class="has-comment-checkbox"
        />
      }
      <div class="flex-1 flex flex-col">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupInputWithCheckbox implements OnInit {
  hasCommentControl = input<FormControl<boolean> | null>(null);
  showCheckbox = input<boolean>(false);
  valueChanged = output<boolean>();
  private readonly destroyRef = inject(DestroyRef);
  private subscriptionCreated = false;

  ngOnInit(): void {
    // Prevent multiple subscriptions if ngOnInit is called multiple times
    if (this.subscriptionCreated) return;

    const control = this.hasCommentControl();
    if (!control) return;

    this.subscriptionCreated = true;
    control.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.valueChanged.emit(res);
      })
  }
}
