import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { OverviewBasicInformationSummarySection } from './step-summary-sections/overview-basic-information-summary-section/overview-basic-information-summary-section';
import { OverviewCompanyInformationSummarySection } from './step-summary-sections/overview-company-information-summary-section/overview-company-information-summary-section';
import { OverviewLocationInformationSummarySection } from './step-summary-sections/overview-location-information-summary-section/overview-location-information-summary-section';
import { OverviewLocalAgentInformationSummarySection } from './step-summary-sections/overview-local-agent-information-summary-section/overview-local-agent-information-summary-section';
import { OverviewServiceDetailsSummarySection } from './step-summary-sections/overview-service-details-summary-section/overview-service-details-summary-section';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-overview-step-summary',
  imports: [
    SummarySectionHeader,
    OverviewBasicInformationSummarySection,
    OverviewCompanyInformationSummarySection,
    OverviewLocationInformationSummarySection,
    OverviewLocalAgentInformationSummarySection,
    OverviewServiceDetailsSummarySection,
    PageCommentBox,
  ],
  templateUrl: './overview-step-summary.html',
  styleUrl: './overview-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewStepSummary extends SummaryStepBaseClass {
  private readonly servicePlanFormService = inject(ServicePlanFormService);

  override readonly pageTitleForTL = 'Overview';
  override readonly formGroup: FormGroup = this.servicePlanFormService.step2_overview;

  constructor() {
    super();
    this.servicePlanFormService.syncServicesFromCoverPageToOverview();
  }

  private readonly _basicInfoFormGroup = this.formGroup.get(EMaterialsFormControls.basicInformationFormGroup) as FormGroup;
  private readonly _companyInfoFormGroup = this.formGroup.get(EMaterialsFormControls.overviewCompanyInformationFormGroup) as FormGroup;
  private readonly _locationInfoFormGroup = this.formGroup.get(EMaterialsFormControls.locationInformationFormGroup) as FormGroup;
  private readonly _localAgentFormGroup = this.formGroup.get(EMaterialsFormControls.localAgentInformationFormGroup) as FormGroup;

  basicInformationFormGroup = toSignal<FormGroup>(
    this._basicInfoFormGroup.valueChanges.pipe(startWith(this._basicInfoFormGroup.value), map(() => this._basicInfoFormGroup)),
    { requireSync: true }
  );
  overviewCompanyInformationFormGroup = toSignal<FormGroup>(
    this._companyInfoFormGroup.valueChanges.pipe(startWith(this._companyInfoFormGroup.value), map(() => this._companyInfoFormGroup)),
    { requireSync: true }
  );
  locationInformationFormGroup = toSignal<FormGroup>(
    this._locationInfoFormGroup.valueChanges.pipe(startWith(this._locationInfoFormGroup.value), map(() => this._locationInfoFormGroup)),
    { requireSync: true }
  );
  localAgentInformationFormGroup = toSignal<FormGroup>(
    this._localAgentFormGroup.valueChanges.pipe(startWith(this._localAgentFormGroup.value), map(() => this._localAgentFormGroup)),
    { requireSync: true }
  );
  overviewFormGroup = toSignal<FormGroup>(
    this.formGroup.valueChanges.pipe(startWith(this.formGroup.value), map(() => this.formGroup)),
    { requireSync: true }
  );

  showLocalAgentInformation = computed(
    () => this.locationInformationFormGroup().get(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA)?.value === true
  );

  basicInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('basicInformation'));
  overviewCompanyInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('overviewCompanyInformation'));
  locationInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('locationInformation'));
  localAgentInformationSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('localAgentInformation'));
  serviceDetailsSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('serviceDetails'));
}
