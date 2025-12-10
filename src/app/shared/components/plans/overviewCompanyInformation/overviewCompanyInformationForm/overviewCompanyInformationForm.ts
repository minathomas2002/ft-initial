import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MaterialsFormService } from 'src/app/shared/services/plan/materials-form-service/materials-form-service';
import { BaseLabelComponent } from '../../../base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseErrorComponent } from '../../../base-components/base-error/base-error.component';
import { TrimOnBlurDirective } from 'src/app/shared/directives';

@Component({
  selector: 'app-overview-company-information-form',
  imports: [
    BaseLabelComponent,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ReactiveFormsModule,
    BaseErrorComponent,
    TrimOnBlurDirective
  ],
  templateUrl: './overviewCompanyInformationForm.html',
  styleUrl: './overviewCompanyInformationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewCompanyInformationForm {
  private readonly materialsFormService = inject(MaterialsFormService);
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly planStore = inject(PlanStore);

  formGroup = this.materialsFormService.overviewCompanyInformation;
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes();
  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  basicInformationFormGroupControls = this.materialsFormService.basicInformationFormGroup.controls;

  ngOnInit(): void {
  }
}
