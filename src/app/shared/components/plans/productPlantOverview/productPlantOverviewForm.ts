import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MaterialsFormService } from 'src/app/shared/services/plan/materials-form-service/materials-form-service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseLabelComponent } from '../../base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GroupInputWithCheckbox } from '../../form/group-input-with-checkbox/group-input-with-checkbox';
import { BaseErrorComponent } from '../../base-components/base-error/base-error.component';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-plant-overview-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BaseLabelComponent,
    InputTextModule,
    SelectModule,
    RadioButtonModule,
    GroupInputWithCheckbox,
    BaseErrorComponent
  ],
  templateUrl: './productPlantOverviewForm.html',
  styleUrl: './productPlantOverviewForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPlantOverviewForm {
  private readonly materialsFormService = inject(MaterialsFormService);
  private readonly destroyRef = inject(DestroyRef);

  // Expose enum to template
  readonly EMaterialsFormControls = EMaterialsFormControls;

  formGroup = this.materialsFormService.step2_productPlantOverview;
  showCheckbox = signal(false);

  // Form group accessors
  get overviewFormGroupControls() {
    return this.materialsFormService.overviewFormGroup.controls;
  }

  get expectedCAPEXInvestmentFormGroupControls() {
    return this.materialsFormService.expectedCAPEXInvestmentFormGroup.controls;
  }

  get targetCustomersFormGroupControls() {
    return this.materialsFormService.targetCustomersFormGroup.controls;
  }

  get productManufacturingExperienceFormGroupControls() {
    return this.materialsFormService.productManufacturingExperienceFormGroup.controls;
  }

  // Conditional visibility signals
  showSECFields = signal(false);
  showLocalSuppliersFields = signal(false);
  showTargetedSuppliersFields = signal(false);
  showOthersDescription = signal(false);

  ngOnInit(): void {
    this.setupConditionalValidations();
  }

  setupConditionalValidations(): void {
    // Listen to provideToSEC changes
    const provideToSECControl = this.getFormControl(
      this.productManufacturingExperienceFormGroupControls[EMaterialsFormControls.provideToSEC]
    );
    provideToSECControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: boolean | null) => {
        this.showSECFields.set(value === true);
        this.materialsFormService.toggleSECFieldsValidation(value === true);
      });

    // Listen to provideToLocalSuppliers changes
    const provideToLocalSuppliersControl = this.getFormControl(
      this.productManufacturingExperienceFormGroupControls[EMaterialsFormControls.provideToLocalSuppliers]
    );
    provideToLocalSuppliersControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: boolean | null) => {
        this.showLocalSuppliersFields.set(value === true);
        this.materialsFormService.toggleLocalSuppliersFieldsValidation(value === true);
      });

    // Listen to targetedCustomer changes
    const targetedCustomerControl = this.getFormControl(
      this.targetCustomersFormGroupControls[EMaterialsFormControls.targetedCustomer]
    );
    targetedCustomerControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string[] | null) => {
        const hasLocalSuppliers = value?.includes("SEC's approved local suppliers") || false;
        this.showTargetedSuppliersFields.set(hasLocalSuppliers);
        this.materialsFormService.toggleTargetedSuppliersFieldsValidation(value || []);
      });

    // Listen to othersPercentage changes
    const othersPercentageControl = this.getFormControl(
      this.expectedCAPEXInvestmentFormGroupControls[EMaterialsFormControls.othersPercentage]
    );
    othersPercentageControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: number | null) => {
        this.showOthersDescription.set(value !== null && value > 0);
        this.materialsFormService.toggleOthersDescriptionValidation(value);
      });
  }

  // Helper methods
  getHasCommentControl(control: AbstractControl): FormControl<boolean> {
    const formGroup = control as FormGroup;
    const hasCommentControl = formGroup.get(EMaterialsFormControls.hasComment);
    return hasCommentControl as unknown as FormControl<boolean>;
  }

  getValueControl(control: AbstractControl): FormControl<any> {
    const formGroup = control as FormGroup;
    const valueControl = formGroup.get(EMaterialsFormControls.value);
    return valueControl as unknown as FormControl<any>;
  }

  getFormControl(control: AbstractControl): FormControl<any> {
    return control as unknown as FormControl<any>;
  }

  // Dropdown options
  targetedCustomerOptions = [
    { label: "SEC's approved local suppliers", value: "SEC's approved local suppliers" },
    { label: 'Other', value: 'Other' }
  ];

  productManufacturingExperienceOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ];
}

