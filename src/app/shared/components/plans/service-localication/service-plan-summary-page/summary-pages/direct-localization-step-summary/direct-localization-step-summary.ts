import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionDirectLocalization } from '../../../service-localization-step-summary/summary-sections/summary-section-direct-localization/summary-section-direct-localization';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';

@Component({
  selector: 'app-direct-localization-step-summary',
  imports: [SummarySectionDirectLocalization, PageCommentBox],
  templateUrl: './direct-localization-step-summary.html',
  styleUrl: './direct-localization-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectLocalizationStepSummary extends SummaryStepBaseClass {
  private readonly servicePlanFormService = inject(ServicePlanFormService);

  override readonly pageTitleForTL = 'Direct Localization';
  override readonly formGroup: FormGroup = this.servicePlanFormService.step4_directLocalization;

  pageCommentsArray = computed(() => {
    const c = this.stepComments();
    return c ? [c] : [];
  });

  originalPlanResponse = computed(() => this.planStore.servicePlanData());
}
