import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { EMaterialsFormControls, EPlanPageTitle } from 'src/app/shared/enums';
import { IFieldInformation, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { ValueChainSectionSummaryComponent } from './value-chain-section-summary/value-chain-section-summary';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Step 3 summary: per-section field lists still come from {@link SummaryStepBaseClass.getSectionSummaryFields};
 * add/remove row detection and per-cell before/after (without relying only on commented fields) live in
 * {@link ValueChainSectionSummaryComponent}.
 */
@Component({
  selector: 'app-value-chain-step-summary',
  imports: [
    TranslatePipe,
    TooltipModule,
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
  readonly pageTitleForTL = EPlanPageTitle.ValueChain;
  formGroup = this.productPlanFormService.step3_valueChain;
  doRefresh = signal(new Date());

  /** Baseline plan for value-chain row add/remove/diff (optional; section summary falls back to store). */
  readonly originalPlanResponse = input<IProductPlanResponse | null>(null);

  private readonly _designEngineeringFormGroup = this.formGroup.get(EMaterialsFormControls.designEngineeringFormGroup) as FormGroup;
  private readonly _sourcingFormGroup = this.formGroup.get(EMaterialsFormControls.sourcingFormGroup) as FormGroup;
  private readonly _manufacturingFormGroup = this.formGroup.get(EMaterialsFormControls.manufacturingFormGroup) as FormGroup;
  private readonly _assemblyTestingFormGroup = this.formGroup.get(EMaterialsFormControls.assemblyTestingFormGroup) as FormGroup;
  private readonly _afterSalesFormGroup = this.formGroup.get(EMaterialsFormControls.afterSalesFormGroup) as FormGroup;

  designEngineeringFormGroup = toSignal<FormGroup>(
    merge(
      this._designEngineeringFormGroup.valueChanges,
      this._designEngineeringFormGroup.statusChanges
    ).pipe(
      startWith(null),
      tap(() => {
        this.doRefresh.set(new Date())
      }),
      map(() => this._designEngineeringFormGroup)
    ),
    { requireSync: true }
  );
  sourcingFormGroup = toSignal<FormGroup>(
    merge(
      this._sourcingFormGroup.valueChanges,
      this._sourcingFormGroup.statusChanges
    ).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this._sourcingFormGroup)
    ),
    { requireSync: true }
  );
  manufacturingFormGroup = toSignal<FormGroup>(
    merge(
      this._manufacturingFormGroup.valueChanges,
      this._manufacturingFormGroup.statusChanges
    ).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this._manufacturingFormGroup)
    ),
    { requireSync: true }
  );
  assemblyTestingFormGroup = toSignal<FormGroup>(
    merge(
      this._assemblyTestingFormGroup.valueChanges,
      this._assemblyTestingFormGroup.statusChanges
    ).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this._assemblyTestingFormGroup)
    ),
    { requireSync: true }
  );
  afterSalesFormGroup = toSignal<FormGroup>(
    merge(
      this._afterSalesFormGroup.valueChanges,
      this._afterSalesFormGroup.statusChanges
    ).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this._afterSalesFormGroup)
    ),
    { requireSync: true }
  );

  /** True when step 3 form has validateTotalCostPercentage error (total cost % !== 100). */
  hasTotalCostPercentageError = toSignal(
    merge(this.formGroup.valueChanges, this.formGroup.statusChanges).pipe(
      startWith(null),
      map(() => !!(this.formGroup.errors?.['totalExceeds100']))
    ),
    { initialValue: !!(this.formGroup.errors?.['totalExceeds100']) }
  );

  designEngineeringSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('designEngineering'));
  sourcingSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('sourcing'));
  manufacturingSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('manufacturing'));
  assemblyTestingSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('assemblyTesting'));
  afterSalesSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('afterSales'));

  year1Total = computed(() => {
    this.doRefresh();
    return this.productPlanFormService.calculateYearTotalLocalization(1);
  });
  year2Total = computed(() => {
    this.doRefresh();
    return this.productPlanFormService.calculateYearTotalLocalization(2);
  });
  year3Total = computed(() => {
    this.doRefresh();
    return this.productPlanFormService.calculateYearTotalLocalization(3);
  });
  year4Total = computed(() => {
    this.doRefresh();
    return this.productPlanFormService.calculateYearTotalLocalization(4);
  });
  year5Total = computed(() => {
    this.doRefresh();
    return this.productPlanFormService.calculateYearTotalLocalization(5);
  });
  year6Total = computed(() => {
    this.doRefresh();
    return this.productPlanFormService.calculateYearTotalLocalization(6);
  });
  year7Total = computed(() => {
    this.doRefresh();
    return this.productPlanFormService.calculateYearTotalLocalization(7);
  });
}
