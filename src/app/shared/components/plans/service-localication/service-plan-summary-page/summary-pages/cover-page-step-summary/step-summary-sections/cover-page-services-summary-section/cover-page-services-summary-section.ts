import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-cover-page-services-summary-section',
  imports: [PlanSummaryFlied, TableModule],
  templateUrl: './cover-page-services-summary-section.html',
  styleUrl: './cover-page-services-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverPageServicesSummarySection extends SummarySectionBaseClass {

  private get servicesFormArray(): FormArray {
    return this.sectionFormGroup().get(EMaterialsFormControls.servicesFormGroup) as FormArray;
  }

  serviceRows = computed(() => {
    const arr = this.servicesFormArray;
    if (!arr || !arr.controls.length) return [];

    return arr.controls.map((ctrl, i) => {
      const group = ctrl as FormGroup;
      const rowId = group.get('rowId')?.value ?? null;
      const serviceNameCtrl = group.get(EMaterialsFormControls.serviceName);
      const valueCtrl = serviceNameCtrl instanceof FormGroup
        ? serviceNameCtrl.get(EMaterialsFormControls.value)
        : null;
      const value = valueCtrl?.value ?? '';
      const beforeValue = this.planStore.servicePlanData()?.servicePlan?.services?.[i]?.serviceName ?? '';
      const hasError = valueCtrl ? (valueCtrl.invalid && valueCtrl.dirty) : false;
      const hasComment = this.isFieldHasCommentForService(EMaterialsFormControls.serviceName, rowId, i);
      const showDiff = valueCtrl ? (valueCtrl.dirty && this.planStore.wizardMode() === 'resubmit') : false;

      return {
        label: ``,
        summaryField: {
          label: '',
          beforeValue: String(beforeValue ?? ''),
          currantValue: value ?? '',
          hasError,
          hasComment,
          isResolved: this.isResolvedFieldForService(EMaterialsFormControls.serviceName, rowId, i, group),
          showDifference: showDiff,
        } as IPlanSummaryField,
      };
    });
  });

  private isResolvedFieldForService(fieldKey: string, rowId: string | null, index: number, rowGroup: FormGroup): boolean {
    const fieldCtrl = rowGroup.get(fieldKey);
    const hasCommentControl = fieldCtrl instanceof FormGroup
      ? fieldCtrl.get(EMaterialsFormControls.hasComment)
      : null;
    const isHasCommentChecked = hasCommentControl?.value ?? false;

    return this.isFieldHasCommentForService(fieldKey, rowId, index) &&
      !isHasCommentChecked &&
      ['view', 'Review'].includes(this.planStore.wizardMode()) &&
      this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
  }

  private isFieldHasCommentForService(fieldKey: string, rowId: string | null = null, index?: number): boolean {
    return this.sectionSummaryFields().some((f) => {
      if (f.inputKey !== fieldKey && f.inputKey !== `${fieldKey}_${index}` && !f.inputKey?.startsWith(`${fieldKey}_`)) return false;
      if (rowId != null) return f.id === rowId;
      if (index != null) return f.inputKey === `${fieldKey}_${index}` || f.id === rowId;
      return true;
    });
  }
}
