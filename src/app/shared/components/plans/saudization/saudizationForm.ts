import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-saudization-form',
  imports: [ReactiveFormsModule],
  templateUrl: './saudizationForm.html',
  styleUrl: './saudizationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaudizationForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);

  formGroup = this.productPlanFormService.step4_saudization;
}

