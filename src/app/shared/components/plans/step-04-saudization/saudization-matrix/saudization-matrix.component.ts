import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { BaseErrorMessages } from '../../../base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-saudization-matrix',
  imports: [
    ReactiveFormsModule,
    BaseErrorMessages,
    GroupInputWithCheckbox,
    InputNumberModule,
  ],
  templateUrl: './saudization-matrix.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaudizationMatrixComponent {
  // Input functions for accessing form controls
  getValueControl = input.required<(formGroup: AbstractControl) => FormControl<any>>();
  getHasCommentControl = input.required<(formGroup: AbstractControl) => FormControl<boolean>>();
  getRowControl = input.required<(year: number, rowName: string) => AbstractControl | null>();

  // Input signal for checkbox visibility
  showCheckbox = input.required<boolean>();

  // Enum reference
  readonly EMaterialsFormControls = EMaterialsFormControls;
}
