import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SaudiCompanyDetailsSummarySection } from './step-summary-sections/saudi-company-details-summary-section/saudi-company-details-summary-section';
import { CollaborationPartnershipSummarySection } from './step-summary-sections/collaboration-partnership-summary-section/collaboration-partnership-summary-section';
import { EntityLevelSummarySection } from './step-summary-sections/entity-level-summary-section/entity-level-summary-section';
import { ServiceLevelSummarySection } from './step-summary-sections/service-level-summary-section/service-level-summary-section';
import { AttachmentsSummarySection } from './step-summary-sections/attachments-summary-section/attachments-summary-section';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { EMaterialsFormControls } from 'src/app/shared/enums';
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

  override readonly pageTitleForTL = 'Existing Saudi Co.';
  override readonly formGroup: FormGroup = this.servicePlanFormService.step3_existingSaudi;

  constructor() {
    super();
    this.servicePlanFormService.syncServicesFromCoverPageToExistingSaudi();
  }

  private readonly _existingSaudiFormGroup = this.formGroup;
  existingSaudiFormGroup = toSignal<FormGroup>(
    this._existingSaudiFormGroup.valueChanges.pipe(
      startWith(this._existingSaudiFormGroup.value),
      map(() => this._existingSaudiFormGroup)
    ),
    { requireSync: true }
  );

  attachmentsFormGroup = toSignal<FormGroup>(
    this.servicePlanFormService.attachmentsFormGroup.valueChanges.pipe(
      startWith(this.servicePlanFormService.attachmentsFormGroup.value),
      map(() => this.servicePlanFormService.attachmentsFormGroup)
    ),
    { requireSync: true }
  );

  saudiCompanyDetailsSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('saudiCompanyDetails'));
  collaborationPartnershipSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('collaborationPartnership'));
  entityLevelSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('entityLevel'));
  serviceLevelSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('serviceLevel'));
  attachmentsSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('attachments'));
}
