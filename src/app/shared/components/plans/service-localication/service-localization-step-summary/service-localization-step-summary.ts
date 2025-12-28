import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';

@Component({
  selector: 'app-service-localization-step-summary',
  imports: [],
  templateUrl: './service-localization-step-summary.html',
  styleUrl: './service-localization-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepSummary {
  isViewMode = input<boolean>(false);
  onEditStep = output<number>();
  onValidationErrorsChange = output<Map<number, IStepValidationErrors>>();
}
