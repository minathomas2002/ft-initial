import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-group-input-with-checkbox',
  imports: [CheckboxModule, ReactiveFormsModule],
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
export class GroupInputWithCheckbox {
  hasCommentControl = input.required<FormControl<boolean>>();
  showCheckbox = input<boolean>(false);

  constructor() {
    effect((onCleanup) => {
      const control = this.hasCommentControl();
      if (!control) return;

      const sub = control.valueChanges.subscribe(value => {
        console.log(value);
      });

      onCleanup(() => sub.unsubscribe());
    });
  }
}
