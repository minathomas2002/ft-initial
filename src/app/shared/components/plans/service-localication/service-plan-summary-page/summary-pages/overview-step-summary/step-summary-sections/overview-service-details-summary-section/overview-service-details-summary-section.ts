import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, ERoles, EServiceProvidedTo } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TableModule } from 'primeng/table';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-overview-service-details-summary-section',
  imports: [PlanSummaryFlied, TableModule, TranslatePipe],
  templateUrl: './overview-service-details-summary-section.html',
  styleUrl: './overview-service-details-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewServiceDetailsSummarySection extends SummarySectionBaseClass {

  private get serviceDetailsFormArray(): FormArray {
    return this.sectionFormGroup().get(EMaterialsFormControls.serviceDetailsFormGroup) as FormArray;
  }

  private formatSelectValue(raw: unknown, options: Array<{ id: string; name: string }>): string | null {
    if (raw === null || raw === undefined || raw === '') return null;
    const ids = Array.isArray(raw) ? raw : [raw];
    const labels = ids
      .map((id) => options.find((o) => o.id === String(id))?.name ?? String(id))
      .filter((x) => x !== null && x !== undefined && String(x).trim() !== '');
    return labels.length ? labels.join(', ') : null;
  }

  private hasServiceProvidedToOthers(value: unknown): boolean {
    const list = Array.isArray(value) ? value : [];
    const selected = list.map((v) => String(v));
    return selected.includes(EServiceProvidedTo.Others.toString());
  }

  private toYesNoDisplay(raw: unknown): string {
    if (raw === null || raw === undefined || raw === '') return '';
    if (raw === true) return this.i18nService.translate('common.yes');
    if (raw === false) return this.i18nService.translate('common.no');
    const s = String(raw).toLowerCase();
    if (s === 'true' || s === 'yes') return this.i18nService.translate('common.yes');
    if (s === 'false' || s === 'no') return this.i18nService.translate('common.no');
    const opt = this.planStore.yesNoOptionsTranslated().find((o) => o.id === String(raw));
    return opt?.name ?? String(raw);
  }

  serviceDetailsRows = computed(() => {
    this.doRefresh();
    const arr = this.serviceDetailsFormArray;
    if (!arr?.controls?.length) return [];

    return arr.controls.map((ctrl, i) => {
      const group = ctrl as FormGroup;
      const rowId = group.get('rowId')?.value ?? null;
      const plan = this.planStore.servicePlanData()?.servicePlan;
      const service = plan?.services?.[i];

      const getValue = (controlName: string) => {
        const ctrl2 = group.get(controlName);
        if (ctrl2 instanceof FormGroup) return ctrl2.get(EMaterialsFormControls.value)?.value;
        return ctrl2?.value;
      };

      const buildField = (
        label: string,
        currantVal: string | null,
        beforeVal: string | null,
        controlName: string
      ): IPlanSummaryField => {
        const ctrl = group.get(controlName);
        const valueControl = ctrl instanceof FormGroup ? ctrl.get(EMaterialsFormControls.value) : ctrl;
        const hasError = !!(valueControl && (valueControl as { invalid?: boolean }).invalid && (valueControl as { dirty?: boolean }).dirty);
        const hasComment = this.hasServiceDetailComment(controlName, rowId);
        const isResolved = this.isResolvedFieldForServiceDetail(controlName, rowId, i, group);
        return {
          label,
          beforeValue: String(beforeVal ?? ''),
          currantValue: currantVal ?? '',
          hasError,
          hasComment,
          isResolved,
          showDifference: this.shouldShowDifference(currantVal, beforeVal),
        };
      };

      const currantServiceName = String(getValue(EMaterialsFormControls.serviceName) ?? '');
      const beforeServiceName = currantServiceName

      const currantServiceType = this.formatSelectValue(getValue(EMaterialsFormControls.serviceType), this.planStore.serviceTypeOptionsTranslated());
      const beforeServiceType = this.formatSelectValue(service?.serviceType ?? null, this.planStore.serviceTypeOptionsTranslated());

      const currantServiceCategory = this.formatSelectValue(getValue(EMaterialsFormControls.serviceCategory), this.planStore.serviceCategoryOptionsTranslated());
      const beforeServiceCategory = this.formatSelectValue(service?.serviceCategory ?? null, this.planStore.serviceCategoryOptionsTranslated());

      const currantDescription = getValue(EMaterialsFormControls.serviceDescription) ?? '';
      const beforeDescription = service?.serviceDescription ?? null;

      const rawProvidedTo = getValue(EMaterialsFormControls.serviceProvidedTo);
      const currantProvidedTo = this.formatSelectValue(rawProvidedTo, this.planStore.serviceProvidedToOptionsTranslated());
      const beforeProvidedTo = this.formatSelectValue(service?.serviceProvidedTo ?? null, this.planStore.serviceProvidedToOptionsTranslated());
      const showServiceProvidedToCompanyNames = this.hasServiceProvidedToOthers(rawProvidedTo);

      const currantCompanyNames = getValue(EMaterialsFormControls.serviceProvidedToCompanyNames) ?? '';
      const beforeCompanyNames = service?.otherProvidedTo ?? null;

      const currantBusiness = getValue(EMaterialsFormControls.totalBusinessDoneLast5Years) ?? '';
      const beforeBusiness = service?.totalBusinessLast5Years ?? null;

      const currantTargeted = this.toYesNoDisplay(getValue(EMaterialsFormControls.serviceTargetedForLocalization));
      const beforeTargeted = service?.targetedForLocalization != null ? this.toYesNoDisplay(service.targetedForLocalization) : null;

      const currantDate = getValue(EMaterialsFormControls.expectedLocalizationDate) ?? '';
      const beforeDate = service?.expectedLocalizationDate ?? null;

      const currantMethodology = this.formatSelectValue(
        Array.isArray(getValue(EMaterialsFormControls.serviceLocalizationMethodology))
          ? (getValue(EMaterialsFormControls.serviceLocalizationMethodology) as unknown[])?.[0]
          : getValue(EMaterialsFormControls.serviceLocalizationMethodology),
        this.planStore.localizationMethodologyOptionsTranslated()
      );
      const beforeMethodology = this.formatSelectValue(
        Array.isArray(service?.serviceLocalizationMethodology) ? service?.serviceLocalizationMethodology?.[0] : service?.serviceLocalizationMethodology ?? null,
        this.planStore.localizationMethodologyOptionsTranslated()
      );

      return {
        index: i + 1,
        serviceName: buildField('', currantServiceName, beforeServiceName, EMaterialsFormControls.serviceName),
        serviceType: buildField('', currantServiceType, beforeServiceType, EMaterialsFormControls.serviceType),
        serviceCategory: buildField('', currantServiceCategory, beforeServiceCategory, EMaterialsFormControls.serviceCategory),
        serviceDescription: buildField('', currantDescription, beforeDescription, EMaterialsFormControls.serviceDescription),
        serviceProvidedTo: buildField('', currantProvidedTo, beforeProvidedTo, EMaterialsFormControls.serviceProvidedTo),
        showServiceProvidedToCompanyNames,
        serviceProvidedToCompanyNames: buildField('', currantCompanyNames, beforeCompanyNames, EMaterialsFormControls.serviceProvidedToCompanyNames),
        totalBusiness: buildField('', currantBusiness, beforeBusiness, EMaterialsFormControls.totalBusinessDoneLast5Years),
        targetedForLocalization: buildField('', currantTargeted, beforeTargeted, EMaterialsFormControls.serviceTargetedForLocalization),
        expectedDate: buildField('', currantDate, beforeDate, EMaterialsFormControls.expectedLocalizationDate),
        methodology: buildField('', currantMethodology, beforeMethodology, EMaterialsFormControls.serviceLocalizationMethodology),
      };
    });
  });

  /** True if any row has "Others" in Service Provided to, so the Company Names column is shown. */
  showServiceProvidedToCompanyNamesColumn = computed(() =>
    this.serviceDetailsRows().some((row) => row.showServiceProvidedToCompanyNames)
  );

  private hasServiceDetailComment(fieldKey: string, rowId: string | null): boolean {
    return this.sectionSummaryFields().some((f) => {
      if (f.inputKey !== fieldKey && f.inputKey !== `${fieldKey}` && !f.inputKey?.startsWith(`${fieldKey}`)) return false;
      if (rowId != null) return f.id === rowId;
      return f.inputKey === `${fieldKey}` || f.id === rowId;
    });
  }

  private isResolvedFieldForServiceDetail(fieldKey: string, rowId: string | null, index: number, rowGroup: FormGroup): boolean {
    const fieldCtrl = rowGroup.get(fieldKey);
    const hasCommentControl = fieldCtrl instanceof FormGroup
      ? fieldCtrl.get(EMaterialsFormControls.hasComment)
      : null;
    const isHasCommentChecked = hasCommentControl?.value ?? false;

    return this.hasServiceDetailComment(fieldKey, rowId) &&
      !isHasCommentChecked &&
      ['view', 'Review'].includes(this.planStore.wizardMode()) &&
      this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW &&
      this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
  }
}
