import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

export interface GroupInputWithCheckboxFormGroup {
  hasComment: FormControl<boolean>;
  value: FormControl<string | null>;
}

@Component({
  selector: 'app-group-input-with-checkbox',
  imports: [CheckboxModule],
  template: `
    <div class="flex items-center gap-2">
      @if(showCheckbox()){
      <p-checkbox
        [formControl]="hasCommentControl()"
        [binary]="true"
        class="has-comment-checkbox"
        />
      }
      <div class="flex-1 flex flex-col">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './group-input-with-checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupInputWithCheckbox {
  hasCommentControl = input<FormControl<boolean>>();
  showCheckbox = input<boolean>(false);

}
