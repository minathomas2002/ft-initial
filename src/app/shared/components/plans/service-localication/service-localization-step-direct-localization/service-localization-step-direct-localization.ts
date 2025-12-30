import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';

@Component({
  selector: 'app-service-localization-step-direct-localization',
  imports: [],
  templateUrl: './service-localization-step-direct-localization.html',
  styleUrl: './service-localization-step-direct-localization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepDirectLocalization {
  private readonly serviceForm = inject(ServicePlanFormService);

  constructor() {
    // Sync services from cover page to service level on component initialization
    this.serviceForm.syncServicesFromCoverPageToDirectLocalization();
  }
}
