import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { ECommentType, EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation, IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { BasicInformationSummarySection } from './step-summary-sections/basic-Information-summary-section/basic-Information-summary-section';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';

@Component({
  selector: 'app-overview-company-step-summary',
  imports: [
    SummarySectionHeader,
    BasicInformationSummarySection,
    PageCommentBox
  ],
  templateUrl: './overview-company-step-summary.html',
  styleUrl: './overview-company-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewCompanyStepSummary extends SummaryStepBaseClass {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  readonly pageTitleForTL = this.i18nService.translate('plans.wizard.step1.title');
  formGroup = this.productPlanFormService.overviewCompanyInformation;
  private readonly _basicInfoFormGroup = this.formGroup.get(EMaterialsFormControls.basicInformationFormGroup) as FormGroup;

  /* Signals */
  basicInformationFormGroup = toSignal<FormGroup>(
    this._basicInfoFormGroup.valueChanges.pipe(
      startWith(this._basicInfoFormGroup.value),
      map(() => this._basicInfoFormGroup)
    ),
    { requireSync: true }
  );

  basicInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('basicInformation'));

}
