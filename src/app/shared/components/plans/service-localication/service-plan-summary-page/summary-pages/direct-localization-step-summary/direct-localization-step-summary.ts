import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { SummaryStepBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-step-base.class';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { LocalizationStrategySummarySection } from './step-summary-sections/localization-strategy-summary-section/localization-strategy-summary-section';
import { EntityLevelSummarySection } from '../existing-saudi-step-summary/step-summary-sections/entity-level-summary-section/entity-level-summary-section';
import { ServiceLevelSummarySection } from '../existing-saudi-step-summary/step-summary-sections/service-level-summary-section/service-level-summary-section';
import { PageCommentBox } from '../../../../page-comment-box/page-comment-box';
import { EMaterialsFormControls, EPlanPageTitle } from 'src/app/shared/enums';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-direct-localization-step-summary',
  imports: [
    SummarySectionHeader,
    LocalizationStrategySummarySection,
    EntityLevelSummarySection,
    ServiceLevelSummarySection,
    PageCommentBox,
  ],
  templateUrl: './direct-localization-step-summary.html',
  styleUrl: './direct-localization-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectLocalizationStepSummary extends SummaryStepBaseClass {
  private readonly servicePlanFormService = inject(ServicePlanFormService);

  override readonly pageTitleForTL = EPlanPageTitle.DirectLocalization;
  override readonly formGroup: FormGroup = this.servicePlanFormService.step4_directLocalization;
  doRefresh = signal(new Date());
  constructor() {
    super();
    this.servicePlanFormService.syncServicesFromCoverPageToDirectLocalization();
  }

  directLocalizationFormGroup = toSignal<FormGroup>(
    merge(this.formGroup.valueChanges, this.formGroup.statusChanges).pipe(
      startWith(null),
      tap(() => this.doRefresh.set(new Date())),
      map(() => this.formGroup)
    ),
    { requireSync: true }
  );

  localizationStrategySummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('localizationStrategy'));
  entityLevelSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('entityLevel'));
  serviceLevelSummaryFields = computed<IFieldInformation[]>(() => this.getSectionSummaryFields('serviceLevel'));
}
