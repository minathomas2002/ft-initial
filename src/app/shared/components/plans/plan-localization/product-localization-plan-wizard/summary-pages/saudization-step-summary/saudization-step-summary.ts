import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SaudizationSectionSummaryComponent } from './saudization-section-summary/saudization-section-summary';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { PlanSummaryFlied } from '../../../../plan-summary-flied/plan-summary-flied';
import { AttachmentsSummarySection } from '../../../../attachments-summary-section/attachments-summary-section';

@Component({
  selector: 'app-saudization-step-summary',
  imports: [
    AttachmentsSummarySection,
    SummarySectionHeader,
    SaudizationSectionSummaryComponent,
    PageCommentBox,
  ],
  templateUrl: './saudization-step-summary.html',
  styleUrl: './saudization-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaudizationStepSummary extends SummaryStepBaseClass {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  readonly pageTitleForTL = this.i18nService.translate('plans.wizard.step4.title');
  formGroup = this.productPlanFormService.step4_saudization;
  doRefresh = signal(new Date());

  constructor() {
    super();
    this.formGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.doRefresh.set(new Date());
    });
  }

  private get _saudizationFormGroup(): FormGroup {
    return this.productPlanFormService.saudizationFormGroup;
  }

  saudizationFormGroup = toSignal<FormGroup>(
    merge(
      this._saudizationFormGroup.valueChanges,
      this._saudizationFormGroup.statusChanges
    ).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this._saudizationFormGroup)
    ),
    { requireSync: true }
  );

  attachmentsFormGroup = computed(() => this.productPlanFormService.attachmentsFormGroup);
  attachmentsSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('attachments'));

  /** Step 04 comment fields (inputKey e.g. annualHeadcount_year1) */
  sectionSummaryFields = computed<IFieldInformation[]>(() => this.stepComments()?.fields ?? []);

  rowLabels = computed(() => [
    { label: this.i18nService.translate('plans.summary.saudization.annualHeadcount'), rowKey: EMaterialsFormControls.annualHeadcount },
    { label: this.i18nService.translate('plans.summary.saudization.saudizationPercentage'), rowKey: EMaterialsFormControls.saudizationPercentage },
    { label: this.i18nService.translate('plans.summary.saudization.annualTotalCompensation'), rowKey: EMaterialsFormControls.annualTotalCompensation },
    { label: this.i18nService.translate('plans.summary.saudization.saudiCompensationPercentage'), rowKey: EMaterialsFormControls.saudiCompensationPercentage },
  ]);
}
