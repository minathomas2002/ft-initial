import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-collaboration-partnership-summary-section',
  imports: [PlanSummaryFlied, TableModule],
  templateUrl: './collaboration-partnership-summary-section.html',
  styleUrl: './collaboration-partnership-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaborationPartnershipSummarySection extends SummarySectionBaseClass {
  private get collaborationPartnershipFormArray(): FormArray {
    return this.sectionFormGroup().get(EMaterialsFormControls.collaborationPartnershipFormGroup) as FormArray;
  }

  private formatAgreementType(agreementTypeId: string | number | null): string | null {
    if (!agreementTypeId) return null;
    const options = this.planStore.agreementTypeOptions();
    const match = options.find((o) => String(o.id) === String(agreementTypeId));
    return match ? match.name : String(agreementTypeId);
  }

  private formatYesNo(value: string | boolean | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    if (value === true || value === 'true') return 'Yes';
    if (value === false || value === 'false') return 'No';
    const options = this.planStore.yesNoOptions();
    const match = options.find((o) => String(o.id) === String(value));
    return match ? match.name : String(value);
  }

  collaborationPartnershipRows = computed(() => {
    this.doRefresh();
    const arr = this.collaborationPartnershipFormArray;
    if (!arr?.controls?.length) return [];

    const plan = this.planStore.servicePlanData()?.servicePlan;

    return arr.controls.map((ctrl, i) => {
      const group = ctrl as FormGroup;
      const rowId = group.get('rowId')?.value ?? null;
      const partnership = plan?.partnershipModels?.[i];

      const getValue = (controlName: string) => {
        const c = group.get(controlName);
        if (c instanceof FormGroup) return c.get(EMaterialsFormControls.value)?.value;
        return c?.value;
      };

      const buildField = (label: string, currant: string | null, before: string | null, fieldKey: string): IPlanSummaryField => {
        const ctrl = group.get(fieldKey);
        const valueCtrl = ctrl instanceof FormGroup ? ctrl.get(EMaterialsFormControls.value) : ctrl;
        const hasError = !!(valueCtrl && (valueCtrl as { invalid?: boolean }).invalid && (valueCtrl as { dirty?: boolean }).dirty);
        const hasComment = this.hasArrayFieldComment(fieldKey, 'collaborationPartnership', rowId);
        return {
          label,
          beforeValue: String(before ?? ''),
          currantValue: currant ?? '',
          hasError,
          hasComment,
          isResolved: false,
          showDifference: this.shouldShowDifference(currant, before),
        };
      };

      const currantAgreementType = this.formatAgreementType(getValue(EMaterialsFormControls.agreementType));
      const beforeAgreementType = this.formatAgreementType(partnership?.agreementType ? String(partnership.agreementType) : null);
      const currantYesNo = this.formatYesNo(getValue(EMaterialsFormControls.provideAgreementCopy));
      const beforeYesNo = this.formatYesNo(partnership?.agreementCopyProvided ?? null);

      return {
        agreementType: buildField('', currantAgreementType, beforeAgreementType, EMaterialsFormControls.agreementType),
        agreementOtherDetails: buildField('', getValue(EMaterialsFormControls.agreementOtherDetails) ?? null, partnership?.otherAgreementType ?? null, EMaterialsFormControls.agreementOtherDetails),
        agreementSigningDate: buildField('', getValue(EMaterialsFormControls.agreementSigningDate) ?? null, partnership?.agreementSigningDate ?? null, EMaterialsFormControls.agreementSigningDate),
        supervisionOversightEntity: buildField('', getValue(EMaterialsFormControls.supervisionOversightEntity) ?? null, partnership?.supervisionEntity ?? null, EMaterialsFormControls.supervisionOversightEntity),
        whyChoseThisCompany: buildField('', getValue(EMaterialsFormControls.whyChoseThisCompany) ?? null, partnership?.selectionJustification ?? null, EMaterialsFormControls.whyChoseThisCompany),
        summaryOfKeyAgreementClauses: buildField('', getValue(EMaterialsFormControls.summaryOfKeyAgreementClauses) ?? null, partnership?.keyAgreementClauses ?? null, EMaterialsFormControls.summaryOfKeyAgreementClauses),
        provideAgreementCopy: buildField('', currantYesNo, beforeYesNo, EMaterialsFormControls.provideAgreementCopy),
      };
    });
  });

  private hasArrayFieldComment(fieldKey: string, section: string, rowId: string | null): boolean {
    // In the edit step, some fields use a UI-friendly inputKey (e.g. `whyChoseThisCompany_{index}`)
    // even if the underlying form control key is a different enum value.
    const aliases: string[] = [];
    if (fieldKey === EMaterialsFormControls.whyChoseThisCompany) aliases.push('whyChoseThisCompany');

    return this.sectionSummaryFields().some((f) => {
      const matchKey =
        f.inputKey === fieldKey ||
        f.inputKey === `${section}.${fieldKey}` ||
        (f.inputKey?.startsWith(fieldKey + '_') && /^\d+$/.test(f.inputKey.substring(fieldKey.length + 1))) ||
        aliases.some((alias) =>
          f.inputKey === alias ||
          f.inputKey === `${section}.${alias}` ||
          (f.inputKey?.startsWith(alias + '_') && /^\d+$/.test(f.inputKey.substring(alias.length + 1)))
        );
      if (!matchKey) return false;
      return rowId == null ? f.id == null : f.id === rowId;
    });
  }
}
