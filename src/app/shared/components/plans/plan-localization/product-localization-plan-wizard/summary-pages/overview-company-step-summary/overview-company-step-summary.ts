import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { BasicInformationSummarySection } from './step-summary-sections/basic-Information-summary-section/basic-Information-summary-section';
import { CompanyInformationSummarySection } from './step-summary-sections/company-information-summary-section/company-information-summary-section';
import { LocationInformationSummarySection } from './step-summary-sections/location-information-summary-section/location-information-summary-section';
import { LocalAgentInformationSummarySection } from './step-summary-sections/local-agent-information-summary-section/local-agent-information-summary-section';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';

@Component({
  selector: 'app-overview-company-step-summary',
  imports: [
    SummarySectionHeader,
    BasicInformationSummarySection,
    CompanyInformationSummarySection,
    LocationInformationSummarySection,
    LocalAgentInformationSummarySection,
    PageCommentBox,
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
  private readonly _companyInfoFormGroup = this.formGroup.get(EMaterialsFormControls.companyInformationFormGroup) as FormGroup;
  private readonly _locationInfoFormGroup = this.formGroup.get(EMaterialsFormControls.locationInformationFormGroup) as FormGroup;
  private readonly _localAgentFormGroup = this.formGroup.get(EMaterialsFormControls.localAgentInformationFormGroup) as FormGroup;

  /* Signals */
  basicInformationFormGroup = toSignal<FormGroup>(
    this._basicInfoFormGroup.valueChanges.pipe(
      startWith(this._basicInfoFormGroup.value),
      map(() => this._basicInfoFormGroup)
    ),
    { requireSync: true }
  );

  companyInformationFormGroup = toSignal<FormGroup>(
    this._companyInfoFormGroup.valueChanges.pipe(
      startWith(this._companyInfoFormGroup.value),
      map(() => this._companyInfoFormGroup)
    ),
    { requireSync: true }
  );

  locationInformationFormGroup = toSignal<FormGroup>(
    this._locationInfoFormGroup.valueChanges.pipe(
      startWith(this._locationInfoFormGroup.value),
      map(() => this._locationInfoFormGroup)
    ),
    { requireSync: true }
  );

  localAgentInformationFormGroup = toSignal<FormGroup>(
    this._localAgentFormGroup.valueChanges.pipe(
      startWith(this._localAgentFormGroup.value),
      map(() => this._localAgentFormGroup)
    ),
    { requireSync: true }
  );

  basicInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('basicInformation'));
  companyInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('companyInformation'));
  locationInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('locationInformation'));
  localAgentInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('localAgentInformation'));

  showLocalAgentInformation = computed(
    () => this.locationInformationFormGroup().get(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA)?.value === true
  );
}
