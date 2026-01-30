import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionCoverPage } from '../../../service-localization-step-summary/summary-sections/summary-section-cover-page/summary-section-cover-page';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';

@Component({
  selector: 'app-cover-page-step-summary',
  imports: [SummarySectionCoverPage, PageCommentBox],
  templateUrl: './cover-page-step-summary.html',
  styleUrl: './cover-page-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverPageStepSummary extends SummaryStepBaseClass {
  private readonly servicePlanFormService = inject(ServicePlanFormService);

  override readonly pageTitleForTL = 'Cover Page';
  override readonly formGroup: FormGroup = this.servicePlanFormService.step1_coverPage;

  pageCommentsArray = computed(() => {
    const c = this.stepComments();
    return c ? [c] : [];
  });

  originalPlanResponse = computed(() => this.planStore.servicePlanData());
}
