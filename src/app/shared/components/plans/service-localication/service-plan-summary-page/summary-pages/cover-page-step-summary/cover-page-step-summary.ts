import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith, tap } from 'rxjs/operators';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { CoverPageCompanyInformationSummarySection } from './step-summary-sections/cover-page-company-information-summary-section/cover-page-company-information-summary-section';
import { CoverPageServicesSummarySection } from './step-summary-sections/cover-page-services-summary-section/cover-page-services-summary-section';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { DatePipe } from '@angular/common';
import { merge } from 'rxjs';

@Component({
  selector: 'app-cover-page-step-summary',
  imports: [
    SummarySectionHeader,
    CoverPageCompanyInformationSummarySection,
    CoverPageServicesSummarySection,
    PageCommentBox,
  ],
  templateUrl: './cover-page-step-summary.html',
  styleUrl: './cover-page-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class CoverPageStepSummary extends SummaryStepBaseClass {
  private readonly servicePlanFormService = inject(ServicePlanFormService);

  override readonly pageTitleForTL = 'Cover Page';
  override readonly formGroup: FormGroup = this.servicePlanFormService.step1_coverPage;

  private readonly _coverPageCompanyFormGroup = this.formGroup.get(EMaterialsFormControls.coverPageCompanyInformationFormGroup) as FormGroup;
  doRefresh = signal(new Date());
  coverPageCompanyInformationFormGroup = toSignal<FormGroup>(
    merge(this._coverPageCompanyFormGroup.valueChanges, this._coverPageCompanyFormGroup.statusChanges).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this._coverPageCompanyFormGroup)
    ),
    { requireSync: true }
  );

  coverPageFormGroup = toSignal<FormGroup>(
    merge(this.formGroup.valueChanges, this.formGroup.statusChanges).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this.formGroup)
    ),
    { requireSync: true }
  );

  coverPageCompanyInformationSummaryFields = computed<IFieldInformation[]>(() => {
    return this.getSectionSummaryFields('companyInformation')
  });
  coverPageServicesSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('services'));
}
