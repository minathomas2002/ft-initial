import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { EMaterialsFormControls, ERoles } from "src/app/shared/enums";
import { IFieldInformation } from "src/app/shared/interfaces/plans.interface";
import { I18nService } from "src/app/shared/services/i18n";
import { RoleService } from "src/app/shared/services/role/role-service";
import { PlanStore } from "src/app/shared/stores/plan/plan.store";

@Component({
  selector: 'app-summary-section-base',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class SummarySectionBaseClass {
  protected readonly i18nService = inject(I18nService);
  protected readonly datePipe = inject(DatePipe);
  protected readonly planStore = inject(PlanStore);
  public readonly sectionFormGroup = input.required<FormGroup>();
  public readonly sectionSummaryFields = input.required<IFieldInformation[]>();
  protected readonly roleService = inject(RoleService);
  public readonly doRefresh = input.required<Date>();

  protected getFormControl(controlName: string): FormControl {
    return this.sectionFormGroup().get(controlName) as FormControl;
  }

  protected getValueFormControl(controlName: string): FormControl {
    return this.getFormControl(controlName).get(EMaterialsFormControls.value) as FormControl;
  }

  protected isHasCommentControlChecked(controlName: string): boolean {
    return this.getFormControl(controlName).get(EMaterialsFormControls.hasComment)?.value;
  }

  protected isResolvedField(controlName: string, rowId: string | null = null): boolean {
    return this.isFieldHasComment(controlName, rowId) &&
      !this.isHasCommentControlChecked(controlName) &&
      ['view', 'Review'].includes(this.planStore.wizardMode()) &&
      this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
  }

  protected isFieldHasComment(inputKey: string, rowId: string | null = null): boolean {
    return this.sectionSummaryFields().some(summaryField => summaryField.inputKey === inputKey && (summaryField.id ? summaryField.id === rowId : true));
  }

  /**
   * Whether to show before/after difference in resubmit mode.
   * Compares currantValue and beforeValue - no dirty check required.
   */
  protected shouldShowDifference(currantValue: unknown, beforeValue: unknown): boolean {
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    const currant = currantValue === null || currantValue === undefined ? '' : String(currantValue).trim();
    const before = beforeValue === null || beforeValue === undefined ? '' : String(beforeValue).trim();
    return currant !== before;
  }

  protected isFieldHasError(formControl: FormControl): boolean {
    return formControl.invalid && formControl.dirty;
  }

  protected getFormattedDate(dateValue: string): string | null {
    const date = new Date(dateValue);
    return this.datePipe.transform(date, 'dd MMM yyyy');
  }

}