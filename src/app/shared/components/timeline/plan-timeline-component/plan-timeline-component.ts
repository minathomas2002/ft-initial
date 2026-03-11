import { Component, computed, inject, input } from '@angular/core';
import { ICommentFields, ITimeLineResponse } from 'src/app/shared/interfaces/plans.interface';
import { Timeline } from "../../utility-components/timeline/timeline";
import { EInvestorPlanStatus, TColors } from 'src/app/shared/interfaces';
import { Divider } from "primeng/divider";
import { SystemEmployeeRoleMapper } from 'src/app/shared/classes/role.mapper';
import { ERoles } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n';
import { CamelCaseToWordPipe, LocalizedDatePipe, PlanPageTitlePipe, TranslatePipe } from 'src/app/shared/pipes';
import { HandlePlanStatusFactory } from 'src/app/shared/services/plan/planStatusFactory/handle-plan-status-factory';
import { IdentifyUserComponent } from "../../utility-components/identify-user/identify-user.component";
import { EStatusPlanTimeLine } from 'src/app/shared/enums';
import { BaseTagComponent } from "../../base-components/base-tag/base-tag.component";
import { PlanTimelineActionsMapper } from 'src/app/shared/classes/Plan-Timeline/plan-timeline-actions.mapper';
import { PlanTimelineStatusMapper } from 'src/app/shared/classes/Plan-Timeline/plan-timeline-status.mapper';
import { EActionPlanTimeLine } from 'src/app/shared/enums/action-plan-timeline.enum';
import { TextareaModule } from 'primeng/textarea';
import { RoleService } from 'src/app/shared/services/role/role-service';

@Component({
  selector: 'app-plan-timeline-component',
  imports: [
    Timeline,
    LocalizedDatePipe,
    TranslatePipe,
    PlanPageTitlePipe,
    Divider,
    IdentifyUserComponent,
    BaseTagComponent,
    TextareaModule
  ],
  providers: [CamelCaseToWordPipe],
  templateUrl: './plan-timeline-component.html',
  styleUrl: './plan-timeline-component.scss',
})
export class TimelineComponent {
  timelineRequests = input.required<ITimeLineResponse[]>();
  private readonly i18nService = inject(I18nService);
  private readonly employeeRoleMapper = new SystemEmployeeRoleMapper(this.i18nService);
  private readonly actionPlanMapper = new PlanTimelineActionsMapper(this.i18nService);
  private readonly planTimelineStatusMapper = new PlanTimelineStatusMapper(this.i18nService);
  private readonly planStatusFactory = inject(HandlePlanStatusFactory);
  private readonly camelCaseToWordPipe = inject(CamelCaseToWordPipe);
  private readonly roleService = inject(RoleService);
  planStatus = computed(() => this.planStatusFactory.handleValidateStatus());
  isInvestor = computed(() => this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])());

  /** Direction class based on current language (rtl for Arabic, ltr otherwise) */
  directionClass = computed(() =>
    this.i18nService.currentLanguage() === 'ar' ? 'rtl' : 'ltr'
  );
  events = computed<{ color: TColors; item: ITimeLineResponse }[]>(() => {
    const requestData = this.timelineRequests();
    if (!this.timelineRequests) {
      return []; // Return an empty array if request or timelineDetails is null/undefined.  Important for avoiding errors.
    }

    return requestData.map((detail) => {
      const color: TColors =
        detail.status === EStatusPlanTimeLine.Rejected ? 'red' : 'blue';

      return {
        color: color,
        item: {
          ...detail,
        },
      };
    });
  });

  get InvestorPlanStatus() {
    return EInvestorPlanStatus;
  }

  get planApprovedActionsEnum() {
    return [EActionPlanTimeLine.Approved, EActionPlanTimeLine.DeptApproved, EActionPlanTimeLine.DVApproved, EActionPlanTimeLine.EmployeeApproved];
  }

  get planRejectedActionsEnum() {
    return [EActionPlanTimeLine.Rejected, EActionPlanTimeLine.DeptRejected, EActionPlanTimeLine.DVRejected, EActionPlanTimeLine.DVRejectionAcknowledged];
  }

  getUserTranslatedRole(roleCode: ERoles): string {
    return this.employeeRoleMapper.getTranslatedRole(roleCode);
  }

  getNameByLanguage(nameEn: string, nameAr: string): string {
    return this.i18nService.currentLanguage() === 'ar' ? nameAr : nameEn;
  }

  getUserTranslatedAction(item: ITimeLineResponse): string {
    return this.actionPlanMapper.getTranslatedAction(item.actionType, this.actionPlanMapper.getActionParam(item));
  }

  getStatusBadgeColor(status: EStatusPlanTimeLine): TColors {
    return this.planTimelineStatusMapper.getStatusBadgeColor(status);
  }

  getStatusLabel(status: EStatusPlanTimeLine): string {
    return this.planTimelineStatusMapper.getStatusLabel(status);
  }

  getCommentFieldLabel(field: ICommentFields): string {
    // Map display strings (e.g. from API) to translation keys for proper i18n
    const labelKey = this.getLabelTranslationKey(field.label);
    let translatedLabel = this.i18nService.translate(labelKey);

    // Handle "key - Year N" pattern (e.g. saudization matrix fields)
    const yearMatch = field.label.match(/^(.+)\s+-\s+Year\s+(\d+)$/);
    if (yearMatch) {
      const [, keyPart, yearNum] = yearMatch;
      const translatedKey = this.i18nService.translate(this.getLabelTranslationKey(keyPart.trim()));
      const yearLabel = this.i18nService.translate('plans.summary.year');
      translatedLabel = translatedKey !== keyPart.trim()
        ? `${translatedKey} - ${yearLabel} ${yearNum}`
        : translatedLabel;
    }

    // Handle "key - YYYY" pattern (entity/service level year fields)
    const keyYearMatch = field.label.match(/^(.+)\s+-\s+(\d{4})$/);
    if (keyYearMatch) {
      const [, keyPart, yearNum] = keyYearMatch;
      const key = keyPart.trim();
      const yearParamKeys = ['plans.form.headcountYear', 'plans.form.saudizationPercentYear'];
      if (yearParamKeys.includes(key)) {
        const translated = this.i18nService.translate(key, { year: yearNum });
        translatedLabel = translated !== key ? translated : translatedLabel;
      } else {
        const translated = this.i18nService.translate(this.getLabelTranslationKey(key));
        translatedLabel = translated !== key ? `${translated} - ${yearNum}` : translatedLabel;
      }
    }

    if (field.section.toLowerCase() === field.label.toLowerCase()) {
      return translatedLabel;
    }
    const sectionKey = this.getSectionTranslationKey(field.section);
    const translatedSection = this.i18nService.translate(sectionKey);
    const sectionDisplay = translatedSection === sectionKey
      ? this.camelCaseToWordPipe.transform(field.section)
      : translatedSection;
    return sectionDisplay + ' - ' + translatedLabel;
  }

  /** Map label (from API or form) to translation key for proper i18n */
  private getLabelTranslationKey(label: string): string {
    if (!label) return label;
    const displayToKey: Record<string, string> = {
      'Attachments': 'plans.form.attachments',
      'attachments': 'plans.form.attachments',
    };
    return displayToKey[label] ?? label;
  }

  /** Resolve section to translation key; handles camelCase and legacy display strings */
  private getSectionTranslationKey(section: string): string {
    // Normalize display strings like "Attachments" to lowercase for key lookup
    const normalizedSection = section.charAt(0).toLowerCase() + section.slice(1);
    const key = 'plans.form.' + normalizedSection;
    if (this.i18nService.translate(key) !== key) return key;
    const displayToKey: Record<string, string> = {
      'Service Details': 'serviceDetails',
      'Entity Level': 'entityLevel',
      'Service Level': 'serviceLevel',
      'Collaboration Partnership': 'collaborationPartnership',
      'Overview': 'overview',
      'Overview & Company Information': 'overviewCompanyInformation',
      'Other Location Details': 'otherLocationDetails',
      'Design & Engineering': 'designEngineering',
      'Sourcing': 'sourcing',
      'Manufacturing': 'manufacturing',
      'Assembly & Testing': 'assemblyTesting',
      'After Sales': 'afterSales',
      'Attachments': 'attachments',
    };
    const normalized = displayToKey[section] ?? section.replace(/\s+/g, '');
    return 'plans.form.' + normalized;
  }
}
