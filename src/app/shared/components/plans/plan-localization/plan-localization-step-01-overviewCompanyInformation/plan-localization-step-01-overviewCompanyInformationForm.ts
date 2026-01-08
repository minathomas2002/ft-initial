import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TrimOnBlurDirective } from 'src/app/shared/directives';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';

@Component({
  selector: 'app-plan-localization-step-01-overview-company-information-form',
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
    PhoneInputComponent,
    CommentStateComponent
  ],
  templateUrl: './plan-localization-step-01-overviewCompanyInformationForm.html',
  styleUrl: './plan-localization-step-01-overviewCompanyInformationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep01OverviewCompanyInformationForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly planStore = inject(PlanStore);

  showCheckbox = model<boolean>(false);

  formGroup = this.productPlanFormService.overviewCompanyInformation;
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes();
  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  basicInformationFormGroupControls = this.productPlanFormService.basicInformationFormGroup.controls;
  companyInformationFormGroupControls = this.productPlanFormService.companyInformationFormGroup.controls;
  locationInformationFormGroupControls = this.productPlanFormService.locationInformationFormGroup.controls;
  localAgentInformationFormGroupControls = this.productPlanFormService.localAgentInformationFormGroup.controls;

  private doYouCurrentlyHaveLocalAgentInKSAControl = this.locationInformationFormGroupControls[
    EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA
  ]
  private doYouHaveLocalAgentInKSASignal = toSignal(
    this.doYouCurrentlyHaveLocalAgentInKSAControl.valueChanges,
    {
      initialValue: this.doYouCurrentlyHaveLocalAgentInKSAControl.value
    }
  );
  showLocalAgentInformation = computed(() => {
    return this.doYouHaveLocalAgentInKSASignal() === true;
  });

  // Computed signal for opportunity disabled state
  isOpportunityDisabled = computed(() => {
    return this.planStore.appliedOpportunity() !== null;
  });

  constructor() {
    effect(() => {
      const doYouHaveLocalAgentInKSA = this.doYouHaveLocalAgentInKSASignal();
      this.productPlanFormService.toggleLocalAgentInformValidation(doYouHaveLocalAgentInKSA === true);
    });

    // Initialize opportunity value based on appliedOpportunity
    const opportunityControl = this.getFormControl(
      this.basicInformationFormGroupControls[EMaterialsFormControls.opportunity]
    );

    const appliedOpportunity = this.planStore.appliedOpportunity();
    if (appliedOpportunity) {
      opportunityControl.setValue(this.planStore.availableOpportunities()[0]);
    }
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
}
