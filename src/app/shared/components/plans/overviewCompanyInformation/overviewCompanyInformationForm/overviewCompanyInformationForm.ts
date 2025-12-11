import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MaterialsFormService } from 'src/app/shared/services/plan/materials-form-service/materials-form-service';
import { BaseLabelComponent } from '../../../base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseErrorComponent } from '../../../base-components/base-error/base-error.component';
import { TrimOnBlurDirective } from 'src/app/shared/directives';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { pipe } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-overview-company-information-form',
  imports: [
    BaseLabelComponent,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ReactiveFormsModule,
    BaseErrorComponent,
    TrimOnBlurDirective,
    GroupInputWithCheckbox,
    RadioButtonModule
  ],
  templateUrl: './overviewCompanyInformationForm.html',
  styleUrl: './overviewCompanyInformationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewCompanyInformationForm {
  private readonly materialsFormService = inject(MaterialsFormService);
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly planStore = inject(PlanStore);
  private readonly destroyRef = inject(DestroyRef);

  showCheckbox = signal(false);
  showLocalAgentInformation = signal(false);

  formGroup = this.materialsFormService.overviewCompanyInformation;
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes();
  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  basicInformationFormGroupControls = this.materialsFormService.basicInformationFormGroup.controls;
  companyInformationFormGroupControls = this.materialsFormService.companyInformationFormGroup.controls;
  locationInformationFormGroupControls = this.materialsFormService.locationInformationFormGroup.controls;
  localAgentInformationFormGroupControls = this.materialsFormService.localAgentInformationFormGroup.controls;

  ngOnInit(): void {
    this.listenToDoYouCurrentlyHaveLocalAgentInKSAValueChanges();
  }

  getHasCommentControl(formGroup: FormGroup): FormControl<boolean> {
    return formGroup.get('hasComment') as FormControl<boolean>;
  }

  getValueControl(formGroup: FormGroup): FormControl<string | null> {
    return formGroup.get('value') as FormControl<string | null>;
  }

  listenToDoYouCurrentlyHaveLocalAgentInKSAValueChanges(): void {
    this.locationInformationFormGroupControls.doYouCurrentlyHaveLocalAgentInKSA.valueChanges.
      pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: boolean | null) => {
        if (value) {
          this.showLocalAgentInformation.set(true);
          this.materialsFormService.toggleLocalAgentInformValidation(true);
        } else {
          this.showLocalAgentInformation.set(false);
          this.materialsFormService.toggleLocalAgentInformValidation(false);
        }
      });
  }

  save(): void {
    console.log(this.formGroup.value);
  }

  onAddComment(): void {
    this.showCheckbox.set(true);
  }
}
