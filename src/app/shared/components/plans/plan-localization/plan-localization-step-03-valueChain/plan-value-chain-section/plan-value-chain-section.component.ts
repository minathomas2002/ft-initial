import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EInHouseProcuredType, EMaterialsFormControls } from 'src/app/shared/enums';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { HidePlaceholderWhenDisabledEmptyDirective } from 'src/app/shared/directives';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { createValueChainFieldKey } from 'src/app/shared/utils/value-chain-field-helpers';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { OptionalMessage } from 'src/app/shared/components/plans/optional-message/optional-message';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { I18nService } from 'src/app/shared/services/i18n';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

export type ValueChainSectionKey =
  | 'designEngineering'
  | 'sourcing'
  | 'manufacturing'
  | 'assemblyTesting'
  | 'afterSales';

const VALUE_CHAIN_SECTION_I18N: Record<
  ValueChainSectionKey,
  { titleKey: string; addItemKey: string; sectionErrorLabelKey: string }
> = {
  designEngineering: {
    titleKey: 'plans.form.designEngineering',
    addItemKey: 'plans.form.placeholders.addDesignEngineeringItem',
    sectionErrorLabelKey: 'plans.form.designEngineering',
  },
  sourcing: {
    titleKey: 'plans.form.sourcing',
    addItemKey: 'plans.form.placeholders.addSourcingItem',
    sectionErrorLabelKey: 'plans.form.sourcing',
  },
  manufacturing: {
    titleKey: 'plans.form.manufacturing',
    addItemKey: 'plans.form.placeholders.addManufacturingItem',
    sectionErrorLabelKey: 'plans.form.manufacturing',
  },
  assemblyTesting: {
    titleKey: 'plans.form.assemblyTesting',
    addItemKey: 'plans.form.placeholders.addAssemblyTestingItem',
    sectionErrorLabelKey: 'plans.form.assemblyTesting',
  },
  afterSales: {
    titleKey: 'plans.form.afterSales',
    addItemKey: 'plans.form.placeholders.addAfterSalesItem',
    sectionErrorLabelKey: 'plans.form.afterSales',
  },
};

@Component({
  selector: 'app-plan-value-chain-section',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    BaseErrorMessages,
    FormArrayInput,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    CheckboxModule,
    HidePlaceholderWhenDisabledEmptyDirective,
    OptionalMessage,
  ],
  templateUrl: './plan-value-chain-section.component.html',
  styleUrl: './plan-value-chain-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanValueChainSectionComponent {
  readonly EMaterialsFormControls = EMaterialsFormControls;
  readonly planFormService = inject(ProductPlanFormService);
  readonly i18n = inject(I18nService);
  readonly planStore = inject(PlanStore);

  sectionKey = input.required<ValueChainSectionKey>();
  formArray = input.required<FormArray>({ alias: 'ft' });
  showSection = input.required<boolean>();
  isViewMode = input.required<boolean>();
  customHeaderLabels = computed(() => ({
    [EMaterialsFormControls.expenseHeader]: this.i18n.translate('plans.form.expenseHeader'),
    [EMaterialsFormControls.inHouseOrProcured]: this.i18n.translate('plans.form.inHouseProcured'),
    [EMaterialsFormControls.costPercentage]: this.i18n.translate('plans.form.costPercentage'),
    [EMaterialsFormControls.year1]: this.i18n.translate('plans.summary.year1'),
    [EMaterialsFormControls.year2]: this.i18n.translate('plans.summary.year2'),
    [EMaterialsFormControls.year3]: this.i18n.translate('plans.summary.year3'),
    [EMaterialsFormControls.year4]: this.i18n.translate('plans.summary.year4'),
    [EMaterialsFormControls.year5]: this.i18n.translate('plans.summary.year5'),
    [EMaterialsFormControls.year6]: this.i18n.translate('plans.summary.year6'),
    [EMaterialsFormControls.year7]: this.i18n.translate('plans.summary.year7'),
  }));
  showOptionalBadge = input.required<boolean>();

  /** Title, add-row CTA, and array error label keys derived from `sectionKey`. */
  readonly sectionMessages = computed(() => VALUE_CHAIN_SECTION_I18N[this.sectionKey()]);

  inHouseOrProcuredOptions = this.planStore.inHouseProcuredOptionsTranslated;
  localizationStatusOptions = this.planStore.localizationStatusOptionsTranslated;

  createNewItem = (): FormGroup => {
    return this.planFormService.createValueChainItem();
  };

  getValueControl(control: AbstractControl): FormControl<any> {
    return this.planFormService.getValueControl(control);
  }

  /** Returns true when in-house/procured selection is In-house */
  isInHouse(itemControl: AbstractControl): boolean {
    const val = itemControl.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value)?.value;
    return val === '1' || val === EInHouseProcuredType.InHouse || val === EInHouseProcuredType.InHouse.toString();
  }

  /** In create/edit: show year form controls only when Procured; when In House show "No". In view/review: always show. */
  showYearFormControls(itemControl: AbstractControl): boolean {
    return !this.isInHouse(itemControl)
  }
  onInHouseOrProcuredChange = input.required<(itemControl: AbstractControl) => void>();
  upDateSelectedInputs = input.required<
    (value: boolean, fieldInformation: IFieldInformation, itemControl?: AbstractControl) => void
  >();

  fieldKey(controlName: string, index: number): string {
    return createValueChainFieldKey(this.sectionKey(), controlName, index);
  }

  onHasCommentChange(
    event: CheckboxChangeEvent,
    fieldInformation: IFieldInformation,
    itemControl: AbstractControl
  ): void {
    this.upDateSelectedInputs()(!!event.checked, fieldInformation, itemControl);
  }
}
