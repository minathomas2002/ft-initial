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
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-step-02-product-plant-overview-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BaseLabelComponent,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    RadioButtonModule,
    GroupInputWithCheckbox,
    BaseErrorComponent,
    TextareaModule,
    TooltipModule,
    InputNumberModule
  ],
  templateUrl: './step-02-productPlantOverviewForm.html',
  styleUrl: './step-02-productPlantOverviewForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step02ProductPlantOverviewForm {
  private readonly materialsFormService = inject(MaterialsFormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly planStore = inject(PlanStore)

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
    const targetedCustomerControl = this.getValueControl(
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
    const othersPercentageControl = this.getValueControl(
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
  getHasCommentControl(formGroup: AbstractControl): FormControl<boolean> {
    if (formGroup instanceof FormGroup) {
      return formGroup.controls[EMaterialsFormControls.hasComment] as FormControl<boolean>;
    }
    throw new Error('Form group is not a valid form group');
  }

  getValueControl(formGroup: AbstractControl): FormControl<any> {
    if (formGroup instanceof FormGroup) {
      return formGroup.controls[EMaterialsFormControls.value] as FormControl<any>;
    }
    throw new Error('Form group is not a valid form group');
  }

  getFormControl(formControl: AbstractControl): FormControl<any> {
    if (formControl instanceof FormControl) {
      return formControl as FormControl<any>;
    }
    throw new Error('Form control is not a valid form control');
  }

  // Dropdown options
  targetedCustomerOptions = this.planStore.targetedCustomerOptions();
  productManufacturingExperienceOptions = this.planStore.productManufacturingExperienceOptions();
}

