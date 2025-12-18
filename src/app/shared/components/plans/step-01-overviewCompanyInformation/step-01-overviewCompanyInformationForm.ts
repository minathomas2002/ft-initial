import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { BaseLabelComponent } from '../../base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseErrorComponent } from '../../base-components/base-error/base-error.component';
import { TrimOnBlurDirective } from 'src/app/shared/directives';
import { GroupInputWithCheckbox } from '../../form/group-input-with-checkbox/group-input-with-checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { BaseErrorMessages } from '../../base-components/base-error-messages/base-error-messages';
import { PhoneInputComponent } from '../../form/phone-input/phone-input.component';

@Component({
  selector: 'app-step-01-overview-company-information-form',
  imports: [
    BaseLabelComponent,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ReactiveFormsModule,
    TrimOnBlurDirective,
    GroupInputWithCheckbox,
    RadioButtonModule,
    TooltipModule,
    TranslatePipe,
    BaseErrorMessages,
    PhoneInputComponent
  ],
  templateUrl: './step-01-overviewCompanyInformationForm.html',
  styleUrl: './step-01-overviewCompanyInformationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step01OverviewCompanyInformationForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly planStore = inject(PlanStore);
  private readonly destroyRef = inject(DestroyRef);

  showCheckbox = signal(false);
  showLocalAgentInformation = signal(false);

  formGroup = this.productPlanFormService.overviewCompanyInformation;
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes();
  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  basicInformationFormGroupControls = this.productPlanFormService.basicInformationFormGroup.controls;
  companyInformationFormGroupControls = this.productPlanFormService.companyInformationFormGroup.controls;
  locationInformationFormGroupControls = this.productPlanFormService.locationInformationFormGroup.controls;
  localAgentInformationFormGroupControls = this.productPlanFormService.localAgentInformationFormGroup.controls;

  ngOnInit(): void {
    this.listenToDoYouCurrentlyHaveLocalAgentInKSAValueChanges();
  }

  getHasCommentControl(control: AbstractControl): FormControl<boolean> {
    const formGroup = control as FormGroup;
    const hasCommentControl = formGroup.get(EMaterialsFormControls.hasComment);
    return hasCommentControl as unknown as FormControl<boolean>;
  }

  getValueControl(control: AbstractControl): FormControl<string | null> {
    const formGroup = control as FormGroup;
    const valueControl = formGroup.get(EMaterialsFormControls.value);
    return valueControl as unknown as FormControl<string | null>;
  }

  getFormControl(control: AbstractControl): FormControl<any> {
    return control as unknown as FormControl<any>;
  }

  listenToDoYouCurrentlyHaveLocalAgentInKSAValueChanges(): void {
    this.locationInformationFormGroupControls[EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA].valueChanges.
      pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: boolean | null) => {
        if (value) {
          this.showLocalAgentInformation.set(true);
          this.productPlanFormService.toggleLocalAgentInformValidation(true);
        } else {
          this.showLocalAgentInformation.set(false);
          this.productPlanFormService.toggleLocalAgentInformValidation(false);
        }
      });
  }

  checkLocalAgentVisibility(): void {
    const doYouCurrentlyHaveLocalAgentInKSA = this.locationInformationFormGroupControls[EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA].value;
    this.showLocalAgentInformation.set(doYouCurrentlyHaveLocalAgentInKSA);
  }

  save(): void {
    console.log(this.formGroup.value);
  }

  onAddComment(): void {
    this.showCheckbox.set(true);
  }
}
