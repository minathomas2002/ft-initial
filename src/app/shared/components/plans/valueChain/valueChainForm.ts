import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';

@Component({
  selector: 'app-value-chain-form',
  imports: [ReactiveFormsModule],
  templateUrl: './valueChainForm.html',
  styleUrl: './valueChainForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChainForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);

  formGroup = this.productPlanFormService.step3_valueChain;
}

