import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ConditionalColorClassDirective } from 'src/app/shared/directives';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';


interface TableRow {
  label: string;
  subtitle?: string;
  controlName: string;
  placeholder: string;
  min: number;
  max?: number;
  mode?: string;
  prefix?: string;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  alignBaseline?: boolean;
}

@Component({
  selector: 'app-saudization-matrix',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseErrorMessages,
    GroupInputWithCheckbox,
    InputNumberModule,
    TableModule,
    ConditionalColorClassDirective,
  ],
  templateUrl: './saudization-matrix.component.html',
  styleUrl: './saudization-matrix.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaudizationMatrixComponent {
  // Input functions for accessing form controls
  getValueControl = input.required<(formGroup: AbstractControl) => FormControl<any>>();
  getHasCommentControl = input.required<(formGroup: AbstractControl) => FormControl<boolean>>();
  getRowControl = input.required<(year: number, rowName: string) => AbstractControl | null>();

  // Input signal for checkbox visibility
  showCheckbox = input.required<boolean>();

  // Comment functionality inputs
  upDateSelectedInputs = input.required<(value: boolean, fieldInformation: IFieldInformation, rowId?: string) => void>();
  highlightInput = input.required<(inputKey: string, rowId?: string) => boolean>();
  selectedInputColor = input.required<TColors>();

  // Enum reference
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Years array for table columns
  readonly years = [1, 2, 3, 4, 5, 6, 7];

  // Table rows configuration
  readonly tableRows: TableRow[] = [
    {
      label: 'Annual Headcount (#)',
      controlName: EMaterialsFormControls.annualHeadcount,
      placeholder: 'Enter number',
      min: 0,
      alignBaseline: false,
    },
    {
      label: 'Saudization %',
      subtitle: '(No. of Saudi employees / Total employees)',
      controlName: EMaterialsFormControls.saudizationPercentage,
      placeholder: 'Enter percentage',
      min: 0,
      max: 100,
      mode: 'decimal',
      prefix: '%',
      minFractionDigits: 0,
      maxFractionDigits: 2,
      alignBaseline: false,
    },
    {
      label: 'Annual Total Compensation (SAR)',
      controlName: EMaterialsFormControls.annualTotalCompensation,
      placeholder: 'Enter cost',
      min: 0,
      mode: 'decimal',
      minFractionDigits: 0,
      maxFractionDigits: 2,
      alignBaseline: true,
    },
    {
      label: 'Saudi Compensation %',
      subtitle: '(Saudi compensation / Total compensation)',
      controlName: EMaterialsFormControls.saudiCompensationPercentage,
      placeholder: 'Enter percentage',
      min: 0,
      max: 100,
      mode: 'decimal',
      prefix: '%',
      minFractionDigits: 0,
      maxFractionDigits: 2,
      alignBaseline: true,
    },
  ];
}
