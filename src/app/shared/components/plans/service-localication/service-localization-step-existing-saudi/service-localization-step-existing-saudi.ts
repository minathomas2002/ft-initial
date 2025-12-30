import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';

@Component({
  selector: 'app-service-localization-step-existing-saudi',
  imports: [],
  templateUrl: './service-localization-step-existing-saudi.html',
  styleUrl: './service-localization-step-existing-saudi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepExistingSaudi {
  private readonly serviceForm = inject(ServicePlanFormService);

  constructor() {
    // Sync services from cover page to service level on component initialization
    this.serviceForm.syncServicesFromCoverPageToExistingSaudi();
  }
}
