import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionExistingSaudi } from '../../../service-localization-step-summary/summary-sections/summary-section-existing-saudi/summary-section-existing-saudi';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';

@Component({
  selector: 'app-existing-saudi-step-summary',
  imports: [SummarySectionExistingSaudi, PageCommentBox],
  templateUrl: './existing-saudi-step-summary.html',
  styleUrl: './existing-saudi-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistingSaudiStepSummary extends SummaryStepBaseClass {
  private readonly servicePlanFormService = inject(ServicePlanFormService);

  override readonly pageTitleForTL = 'Existing Saudi Co.';
  override readonly formGroup: FormGroup = this.servicePlanFormService.step3_existingSaudi;

  pageCommentsArray = computed(() => {
    const c = this.stepComments();
    return c ? [c] : [];
  });

  originalPlanResponse = computed(() => this.planStore.servicePlanData());
}
