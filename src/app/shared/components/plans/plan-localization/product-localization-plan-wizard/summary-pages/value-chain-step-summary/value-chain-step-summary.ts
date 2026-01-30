import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { ValueChainSectionSummaryComponent } from './value-chain-section-summary/value-chain-section-summary';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-value-chain-step-summary',
  imports: [
    TranslatePipe,
    SummarySectionHeader,
    ValueChainSectionSummaryComponent,
    PageCommentBox,
  ],
  templateUrl: './value-chain-step-summary.html',
  styleUrl: './value-chain-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChainStepSummary extends SummaryStepBaseClass {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  readonly pageTitleForTL = this.i18nService.translate('plans.wizard.step3.title');
  formGroup = this.productPlanFormService.step3_valueChain;
  private readonly formChangeTrigger = signal(0);

  constructor() {
    super();
    this.formGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.formChangeTrigger.update(v => v + 1);
    });
  }

  private sectionFormGroup(sectionKey: string): FormGroup {
    return this.formGroup.get(sectionKey) as FormGroup;
  }

  designEngineeringFormGroup = toSignal<FormGroup>(
    this.sectionFormGroup(EMaterialsFormControls.designEngineeringFormGroup).valueChanges.pipe(
      startWith(this.sectionFormGroup(EMaterialsFormControls.designEngineeringFormGroup).value),
      map(() => this.sectionFormGroup(EMaterialsFormControls.designEngineeringFormGroup))
    ),
    { requireSync: true }
  );
  sourcingFormGroup = toSignal<FormGroup>(
    this.sectionFormGroup(EMaterialsFormControls.sourcingFormGroup).valueChanges.pipe(
      startWith(this.sectionFormGroup(EMaterialsFormControls.sourcingFormGroup).value),
      map(() => this.sectionFormGroup(EMaterialsFormControls.sourcingFormGroup))
    ),
    { requireSync: true }
  );
  manufacturingFormGroup = toSignal<FormGroup>(
    this.sectionFormGroup(EMaterialsFormControls.manufacturingFormGroup).valueChanges.pipe(
      startWith(this.sectionFormGroup(EMaterialsFormControls.manufacturingFormGroup).value),
      map(() => this.sectionFormGroup(EMaterialsFormControls.manufacturingFormGroup))
    ),
    { requireSync: true }
  );
  assemblyTestingFormGroup = toSignal<FormGroup>(
    this.sectionFormGroup(EMaterialsFormControls.assemblyTestingFormGroup).valueChanges.pipe(
      startWith(this.sectionFormGroup(EMaterialsFormControls.assemblyTestingFormGroup).value),
      map(() => this.sectionFormGroup(EMaterialsFormControls.assemblyTestingFormGroup))
    ),
    { requireSync: true }
  );
  afterSalesFormGroup = toSignal<FormGroup>(
    this.sectionFormGroup(EMaterialsFormControls.afterSalesFormGroup).valueChanges.pipe(
      startWith(this.sectionFormGroup(EMaterialsFormControls.afterSalesFormGroup).value),
      map(() => this.sectionFormGroup(EMaterialsFormControls.afterSalesFormGroup))
    ),
    { requireSync: true }
  );

  designEngineeringSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('designEngineering'));
  sourcingSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('sourcing'));
  manufacturingSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('manufacturing'));
  assemblyTestingSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('assemblyTesting'));
  afterSalesSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('afterSales'));

  year1Total = computed(() => {
    this.formChangeTrigger();
    return this.productPlanFormService.calculateYearTotalLocalization(1);
  });
  year2Total = computed(() => {
    this.formChangeTrigger();
    return this.productPlanFormService.calculateYearTotalLocalization(2);
  });
  year3Total = computed(() => {
    this.formChangeTrigger();
    return this.productPlanFormService.calculateYearTotalLocalization(3);
  });
  year4Total = computed(() => {
    this.formChangeTrigger();
    return this.productPlanFormService.calculateYearTotalLocalization(4);
  });
  year5Total = computed(() => {
    this.formChangeTrigger();
    return this.productPlanFormService.calculateYearTotalLocalization(5);
  });
  year6Total = computed(() => {
    this.formChangeTrigger();
    return this.productPlanFormService.calculateYearTotalLocalization(6);
  });
  year7Total = computed(() => {
    this.formChangeTrigger();
    return this.productPlanFormService.calculateYearTotalLocalization(7);
  });
}
