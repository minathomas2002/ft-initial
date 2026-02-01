import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionOverview } from '../../../service-localization-step-summary/summary-sections/summary-section-overview/summary-section-overview';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';

@Component({
  selector: 'app-overview-step-summary',
  imports: [SummarySectionOverview, PageCommentBox],
  templateUrl: './overview-step-summary.html',
  styleUrl: './overview-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewStepSummary extends SummaryStepBaseClass {
  private readonly servicePlanFormService = inject(ServicePlanFormService);

  override readonly pageTitleForTL = 'Overview';
  override readonly formGroup: FormGroup = this.servicePlanFormService.step2_overview;

  pageCommentsArray = computed(() => {
    const c = this.stepComments();
    return c ? [c] : [];
  });

  originalPlanResponse = computed(() => this.planStore.servicePlanData());
}
