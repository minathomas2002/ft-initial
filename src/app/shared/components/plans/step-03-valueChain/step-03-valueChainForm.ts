import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';

@Component({
  selector: 'app-step-03-valueChain-form',
  imports: [ReactiveFormsModule],
  templateUrl: './step-03-valueChainForm.html',
  styleUrl: './step-03-valueChainForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step03ValueChainForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);

  formGroup = this.productPlanFormService.step3_valueChain;
}

