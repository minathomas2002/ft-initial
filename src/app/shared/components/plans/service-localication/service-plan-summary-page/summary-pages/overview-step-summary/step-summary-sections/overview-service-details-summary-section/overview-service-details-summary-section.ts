import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-overview-service-details-summary-section',
  imports: [PlanSummaryFlied, TableModule],
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

  private toYesNoDisplay(raw: unknown): string {
    if (raw === null || raw === undefined || raw === '') return '';
    if (raw === true) return 'Yes';
    if (raw === false) return 'No';
    const s = String(raw).toLowerCase();
    if (s === 'true' || s === 'yes') return 'Yes';
    if (s === 'false' || s === 'no') return 'No';
    const opt = this.planStore.yesNoOptions().find((o) => o.id === String(raw));
    return opt?.name ?? String(raw);
  }

  serviceDetailsRows = computed(() => {
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
        const hasComment = this.hasServiceDetailComment(controlName, rowId, i);
        return {
          label,
          beforeValue: String(beforeVal ?? ''),
          currantValue: currantVal ?? '',
          hasError,
          hasComment,
          isResolved: false,
          showDifference: this.shouldShowDifference(currantVal, beforeVal),
        };
      };

      const currantServiceName = String(getValue(EMaterialsFormControls.serviceName) ?? '');
      const beforeServiceName = service?.serviceName ?? null;

      const currantServiceType = this.formatSelectValue(getValue(EMaterialsFormControls.serviceType), this.planStore.serviceTypeOptions());
      const beforeServiceType = this.formatSelectValue(service?.serviceType ?? null, this.planStore.serviceTypeOptions());

      const currantServiceCategory = this.formatSelectValue(getValue(EMaterialsFormControls.serviceCategory), this.planStore.serviceCategoryOptions());
      const beforeServiceCategory = this.formatSelectValue(service?.serviceCategory ?? null, this.planStore.serviceCategoryOptions());

      const currantDescription = getValue(EMaterialsFormControls.serviceDescription) ?? '';
      const beforeDescription = service?.serviceDescription ?? null;

      const currantProvidedTo = this.formatSelectValue(getValue(EMaterialsFormControls.serviceProvidedTo), this.planStore.serviceProvidedToOptions());
      const beforeProvidedTo = this.formatSelectValue(service?.serviceProvidedTo ?? null, this.planStore.serviceProvidedToOptions());

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
        this.planStore.localizationMethodologyOptions()
      );
      const beforeMethodology = this.formatSelectValue(
        Array.isArray(service?.serviceLocalizationMethodology) ? service?.serviceLocalizationMethodology?.[0] : service?.serviceLocalizationMethodology ?? null,
        this.planStore.localizationMethodologyOptions()
      );

      return {
        index: i + 1,
        serviceName: buildField('', currantServiceName, beforeServiceName, EMaterialsFormControls.serviceName),
        serviceType: buildField('', currantServiceType, beforeServiceType, EMaterialsFormControls.serviceType),
        serviceCategory: buildField('', currantServiceCategory, beforeServiceCategory, EMaterialsFormControls.serviceCategory),
        serviceDescription: buildField('', currantDescription, beforeDescription, EMaterialsFormControls.serviceDescription),
        serviceProvidedTo: buildField('', currantProvidedTo, beforeProvidedTo, EMaterialsFormControls.serviceProvidedTo),
        totalBusiness: buildField('', currantBusiness, beforeBusiness, EMaterialsFormControls.totalBusinessDoneLast5Years),
        targetedForLocalization: buildField('', currantTargeted, beforeTargeted, EMaterialsFormControls.serviceTargetedForLocalization),
        expectedDate: buildField('', currantDate, beforeDate, EMaterialsFormControls.expectedLocalizationDate),
        methodology: buildField('', currantMethodology, beforeMethodology, EMaterialsFormControls.serviceLocalizationMethodology),
      };
    });
  });

  private hasServiceDetailComment(fieldKey: string, rowId: string | null, index: number): boolean {
    return this.sectionSummaryFields().some((f) => {
      if (f.inputKey !== fieldKey && f.inputKey !== `${fieldKey}_${index}` && !f.inputKey?.startsWith(`${fieldKey}_`)) return false;
      if (rowId != null) return f.id === rowId;
      return f.inputKey === `${fieldKey}_${index}` || f.id === rowId;
    });
  }
}
