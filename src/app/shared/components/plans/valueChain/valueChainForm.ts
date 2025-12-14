import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MaterialsFormService } from 'src/app/shared/services/plan/materials-form-service/materials-form-service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-value-chain-form',
  imports: [ReactiveFormsModule],
  templateUrl: './valueChainForm.html',
  styleUrl: './valueChainForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChainForm {
  private readonly materialsFormService = inject(MaterialsFormService);

  formGroup = this.materialsFormService.step3_valueChain;
}

