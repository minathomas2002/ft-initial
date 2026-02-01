import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { OverviewSummarySection } from './step-summary-sections/overview-summary-section/overview-summary-section';
import { ExpectedCapexSummarySection } from './step-summary-sections/expected-capex-summary-section/expected-capex-summary-section';
import { TargetCustomersSummarySection } from './step-summary-sections/target-customers-summary-section/target-customers-summary-section';
import { ProductManufacturingExperienceSummarySection } from './step-summary-sections/product-manufacturing-experience-summary-section/product-manufacturing-experience-summary-section';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-product-plant-overview-step-summary',
  imports: [
    TranslatePipe,
    SummarySectionHeader,
    OverviewSummarySection,
    ExpectedCapexSummarySection,
    TargetCustomersSummarySection,
    ProductManufacturingExperienceSummarySection,
    PageCommentBox,
  ],
  templateUrl: './product-plant-overview-step-summary.html',
  styleUrl: './product-plant-overview-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPlantOverviewStepSummary extends SummaryStepBaseClass {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  readonly pageTitleForTL = this.i18nService.translate('plans.wizard.step2.title');
  formGroup = this.productPlanFormService.step2_productPlantOverview;
  private readonly _overviewFormGroup = this.formGroup.get(EMaterialsFormControls.overviewFormGroup) as FormGroup;
  private readonly _expectedCAPEXFormGroup = this.formGroup.get(EMaterialsFormControls.expectedCAPEXInvestmentFormGroup) as FormGroup;
  private readonly _targetCustomersFormGroup = this.formGroup.get(EMaterialsFormControls.targetCustomersFormGroup) as FormGroup;
  private readonly _productManufacturingFormGroup = this.formGroup.get(EMaterialsFormControls.productManufacturingExperienceFormGroup) as FormGroup;

  overviewFormGroup = toSignal<FormGroup>(
    this._overviewFormGroup.valueChanges.pipe(
      startWith(this._overviewFormGroup.value),
      map(() => this._overviewFormGroup)
    ),
    { requireSync: true }
  );

  expectedCAPEXInvestmentFormGroup = toSignal<FormGroup>(
    this._expectedCAPEXFormGroup.valueChanges.pipe(
      startWith(this._expectedCAPEXFormGroup.value),
      map(() => this._expectedCAPEXFormGroup)
    ),
    { requireSync: true }
  );

  targetCustomersFormGroup = toSignal<FormGroup>(
    this._targetCustomersFormGroup.valueChanges.pipe(
      startWith(this._targetCustomersFormGroup.value),
      map(() => this._targetCustomersFormGroup)
    ),
    { requireSync: true }
  );

  productManufacturingExperienceFormGroup = toSignal<FormGroup>(
    this._productManufacturingFormGroup.valueChanges.pipe(
      startWith(this._productManufacturingFormGroup.value),
      map(() => this._productManufacturingFormGroup)
    ),
    { requireSync: true }
  );

  overviewSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('overview'));
  expectedCAPEXInvestmentSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('expectedCAPEXInvestment'));
  targetCustomersSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('targetCustomers'));
  productManufacturingExperienceSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('productManufacturingExperience'));
}
