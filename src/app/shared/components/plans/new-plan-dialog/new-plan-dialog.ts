import { ChangeDetectionStrategy, Component, computed, inject, model, OnInit, output, signal } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { BaseLabelComponent } from '../../base-components/base-label/base-label.component';
import { BaseErrorComponent } from '../../base-components/base-error/base-error.component';
import { TrimOnBlurDirective } from '../../../directives/trim-on-blur.directive';
import { RadioButton } from 'primeng/radiobutton';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

@Component({
  selector: 'app-new-plan-dialog',
  imports: [
    BaseDialogComponent,
    FormsModule,
    InputTextModule,
    BaseLabelComponent,
    BaseErrorComponent,
    TrimOnBlurDirective,
    RadioButton
  ],
  templateUrl: './new-plan-dialog.html',
  styleUrl: './new-plan-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPlanDialog implements OnInit {
  visibility = model<boolean>(false);
  onConfirm = output<void>();
  onCancel = output<void>();

  newPlanTitle = signal('');
  newPlanOpportunityType = signal<EOpportunityType | null>(null);

  private readonly planStore = inject(PlanStore);
  protected readonly disableChangingOpportunityType = computed(() => this.planStore.isPresetSelected());

  ngOnInit(): void {
    this.newPlanTitle.set('');
    this.newPlanOpportunityType.set(this.planStore.newPlanOpportunityType());
  }

  get EOpportunityType() {
    return EOpportunityType;
  }

  canGoNext() {
    return this.newPlanTitle().trim().length > 0 && this.newPlanOpportunityType() !== null;
  }

  savePlanBasicData(): void {
    this.planStore.savePlanBasicData(this.newPlanOpportunityType()!, this.newPlanTitle());
    this.onConfirm.emit();
  }
}
