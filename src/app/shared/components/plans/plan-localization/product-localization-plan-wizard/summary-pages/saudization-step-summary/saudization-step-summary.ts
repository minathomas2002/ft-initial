import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SaudizationSectionSummaryComponent } from './saudization-section-summary/saudization-section-summary';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-saudization-step-summary',
  imports: [
    TranslatePipe,
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
  private readonly formChangeTrigger = signal(0);

  constructor() {
    super();
    this.formGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.formChangeTrigger.update(v => v + 1);
    });
  }

  private get _saudizationFormGroup(): FormGroup {
    return this.productPlanFormService.saudizationFormGroup;
  }

  saudizationFormGroup = toSignal<FormGroup>(
    this._saudizationFormGroup.valueChanges.pipe(
      startWith(this._saudizationFormGroup.value),
      map(() => this._saudizationFormGroup)
    ),
    { requireSync: true }
  );

  private get _attachmentsFormGroup(): FormGroup {
    return this.productPlanFormService.attachmentsFormGroup;
  }

  /** Step 04 comment fields (inputKey e.g. annualHeadcount_year1) */
  sectionSummaryFields = computed<IFieldInformation[]>(() => this.stepComments()?.fields ?? []);

  rowLabels = computed(() => [
    { label: this.i18nService.translate('plans.summary.saudization.annualHeadcount'), rowKey: EMaterialsFormControls.annualHeadcount },
    { label: this.i18nService.translate('plans.summary.saudization.saudizationPercentage'), rowKey: EMaterialsFormControls.saudizationPercentage },
    { label: this.i18nService.translate('plans.summary.saudization.annualTotalCompensation'), rowKey: EMaterialsFormControls.annualTotalCompensation },
    { label: this.i18nService.translate('plans.summary.saudization.saudiCompensationPercentage'), rowKey: EMaterialsFormControls.saudiCompensationPercentage },
  ]);

  attachments = computed(() => {
    this.formChangeTrigger();
    const attachmentsControl = this._attachmentsFormGroup.get(EMaterialsFormControls.attachments);
    if (attachmentsControl instanceof FormGroup) {
      const valueControl = attachmentsControl.get(EMaterialsFormControls.value);
      return valueControl ? valueControl.value : attachmentsControl.value;
    }
    return attachmentsControl?.value ?? null;
  });

  hasAttachments = computed(() => {
    const atts = this.attachments();
    return atts && Array.isArray(atts) && atts.length > 0;
  });
}
