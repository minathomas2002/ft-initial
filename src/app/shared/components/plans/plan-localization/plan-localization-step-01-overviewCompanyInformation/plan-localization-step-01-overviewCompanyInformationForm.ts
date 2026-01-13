import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrimOnBlurDirective, ConditionalColorClassDirective } from 'src/app/shared/directives';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TextareaModule } from 'primeng/textarea';
import { TCommentPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';
import { TColors } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-plan-localization-step-01-overview-company-information-form',
  imports: [
    BaseLabelComponent,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ReactiveFormsModule,
    TrimOnBlurDirective,
    ConditionalColorClassDirective,
    GroupInputWithCheckbox,
    RadioButtonModule,
    TooltipModule,
    TranslatePipe,
    BaseErrorMessages,
    PhoneInputComponent,
    CommentStateComponent,
    FormsModule,
    TextareaModule
  ],
  templateUrl: './plan-localization-step-01-overviewCompanyInformationForm.html',
  styleUrl: './plan-localization-step-01-overviewCompanyInformationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep01OverviewCompanyInformationForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly planStore = inject(PlanStore);
  private readonly formUtilityService = inject(FormUtilityService);
  pageTitle = input.required<string>();

  showCheckbox = model<boolean>(false);
  commentPhase = model<TCommentPhase>('none');
  selectedInputColor = input.required<TColors>();
  formGroup = this.productPlanFormService.overviewCompanyInformation;
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes();
  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  basicInformationFormGroupControls = this.productPlanFormService.basicInformationFormGroup.controls;
  companyInformationFormGroupControls = this.productPlanFormService.companyInformationFormGroup.controls;
  locationInformationFormGroupControls = this.productPlanFormService.locationInformationFormGroup.controls;
  localAgentInformationFormGroupControls = this.productPlanFormService.localAgentInformationFormGroup.controls;

  companyNameHasCommentControl = computed(() => this.getHasCommentControl(this.companyInformationFormGroupControls['companyName']))
  contactNumberHasCommentControl = computed(() => this.getHasCommentControl(this.localAgentInformationFormGroupControls['contactNumber']))

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

  commentFormControl = this.formGroup.get(EMaterialsFormControls.comment) as FormControl<string>;
  selectedInputs = model<IFieldInformation[]>([])
  comment = signal<string>('');
  pageComment = computed<IPageComment>(() => {
    return {
      pageTitleForTL: this.pageTitle() ?? '',
      comment: this.comment() ?? '',
      fields: this.selectedInputs(),
    }
  });

  upDateSelectedInputs(value: boolean, fliedInformation: IFieldInformation): void {
    if (value) {
      this.selectedInputs.set([...this.selectedInputs(), fliedInformation]);
    } else {
      this.selectedInputs.set(this.selectedInputs().filter(input => input.inputKey !== fliedInformation.inputKey));
    }
  }

  constructor() {
    effect(() => {
      const doYouHaveLocalAgentInKSA = this.doYouHaveLocalAgentInKSASignal();
      this.productPlanFormService.toggleLocalAgentInformValidation(doYouHaveLocalAgentInKSA === true);
    });

    effect(() => {
      if (this.commentPhase() === 'viewing') {
        this.comment.set(this.commentFormControl.value ?? '');
        this.commentFormControl.setValue(this.comment(), { emitEvent: true });
        // disable all hasComment controls
        this.formUtilityService.disableHasCommentControls(this.formGroup);
      }
      if (['adding', 'editing'].includes(this.commentPhase())) {
        // enable all hasComment controls
        this.formUtilityService.enableHasCommentControls(this.formGroup);
      }
    })

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

  onDeleteComments(): void {
    this.resetAllHasCommentControls();
    this.selectedInputs.set([]);
    this.showCheckbox.set(false);
  }

  resetAllHasCommentControls(): void {
    // Reset hasComment controls in all form groups
    this.formUtilityService.resetHasCommentControls(this.formGroup);
  }

  highlightInput(inputKey: string): boolean {
    return this.selectedInputs().some(input => input.inputKey === inputKey) && this.commentPhase() !== 'viewing';
  }
}
