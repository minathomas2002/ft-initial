import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SaudiCompanyDetailsSummarySection } from './step-summary-sections/saudi-company-details-summary-section/saudi-company-details-summary-section';
import { CollaborationPartnershipSummarySection } from './step-summary-sections/collaboration-partnership-summary-section/collaboration-partnership-summary-section';
import { EntityLevelSummarySection } from './step-summary-sections/entity-level-summary-section/entity-level-summary-section';
import { ServiceLevelSummarySection } from './step-summary-sections/service-level-summary-section/service-level-summary-section';
import { AttachmentsSummarySection } from '../../../../attachments-summary-section/attachments-summary-section';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { EMaterialsFormControls, EPlanPageTitle } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-existing-saudi-step-summary',
  imports: [
    SummarySectionHeader,
    SaudiCompanyDetailsSummarySection,
    CollaborationPartnershipSummarySection,
    EntityLevelSummarySection,
    ServiceLevelSummarySection,
    AttachmentsSummarySection,
    PageCommentBox,
  ],
  templateUrl: './existing-saudi-step-summary.html',
  styleUrl: './existing-saudi-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistingSaudiStepSummary extends SummaryStepBaseClass {
  private readonly servicePlanFormService = inject(ServicePlanFormService);

  override readonly pageTitleForTL = EPlanPageTitle.ExistingSaudi;
  readonly displayTitle = computed(() => this.i18nService.translate('plans.wizard.stepTitles.existingSaudi'));
  override readonly formGroup: FormGroup = this.servicePlanFormService.step3_existingSaudi;

  constructor() {
    super();
    this.servicePlanFormService.syncServicesFromCoverPageToExistingSaudi();
  }

  doRefresh = signal(new Date());
  private readonly _existingSaudiFormGroup = this.formGroup;
  existingSaudiFormGroup = toSignal<FormGroup>(
    merge(
      this._existingSaudiFormGroup.valueChanges,
      this._existingSaudiFormGroup.statusChanges
    ).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this._existingSaudiFormGroup)
    ),
    { requireSync: true }
  );

  private readonly _attachmentsFormGroup = this.servicePlanFormService.attachmentsFormGroup;
  attachmentsFormGroup = toSignal<FormGroup>(
    merge(
      this._attachmentsFormGroup.valueChanges,
      this._attachmentsFormGroup.statusChanges
    ).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this._attachmentsFormGroup)
    ),
    { requireSync: true }
  );

  saudiCompanyDetailsSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('saudiCompanyDetails'));
  collaborationPartnershipSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('collaborationPartnership'));
  entityLevelSummaryFields = computed<IFieldInformation[]>(() => {
    return this.getSectionSummaryFields('entityLevel')
  });
  serviceLevelSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('serviceLevel'));
  attachmentsSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('attachments'));
}
