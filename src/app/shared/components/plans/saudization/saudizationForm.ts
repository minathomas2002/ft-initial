import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MaterialsFormService } from 'src/app/shared/services/plan/materials-form-service/materials-form-service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-saudization-form',
  imports: [ReactiveFormsModule],
  templateUrl: './saudizationForm.html',
  styleUrl: './saudizationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaudizationForm {
  private readonly materialsFormService = inject(MaterialsFormService);

  formGroup = this.materialsFormService.step4_saudization;
}

