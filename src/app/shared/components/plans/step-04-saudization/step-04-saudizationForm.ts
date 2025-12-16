import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-04-saudization-form',
  imports: [ReactiveFormsModule],
  templateUrl: './step-04-saudizationForm.html',
  styleUrl: './step-04-saudizationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step04SaudizationForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);

  formGroup = this.productPlanFormService.step4_saudization;
}

