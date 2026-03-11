import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, EProductManufacturingExperience } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-product-manufacturing-experience-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './product-manufacturing-experience-summary-section.html',
  styleUrl: './product-manufacturing-experience-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductManufacturingExperienceSummarySection extends SummarySectionBaseClass {
  private readonly productManufacturingExperienceControl = computed(() => this.getValueFormControl(EMaterialsFormControls.productManufacturingExperience));
  private readonly provideToSECControl = computed(() => this.getFormControl(EMaterialsFormControls.provideToSEC));
  private readonly qualifiedPlantLocationSECControl = computed(() => this.getValueFormControl(EMaterialsFormControls.qualifiedPlantLocationSEC));
  private readonly approvedVendorIDSECControl = computed(() => this.getValueFormControl(EMaterialsFormControls.approvedVendorIDSEC));
  private readonly yearsOfExperienceSECControl = computed(() => this.getValueFormControl(EMaterialsFormControls.yearsOfExperienceSEC));
  private readonly totalQuantitiesSECControl = computed(() => this.getValueFormControl(EMaterialsFormControls.totalQuantitiesSEC));
  private readonly provideToLocalSuppliersControl = computed(() => this.getFormControl(EMaterialsFormControls.provideToLocalSuppliers));
  private readonly namesOfSECApprovedSuppliersControl = computed(() => this.getValueFormControl(EMaterialsFormControls.namesOfSECApprovedSuppliers));
  private readonly qualifiedPlantLocationControl = computed(() => this.getValueFormControl(EMaterialsFormControls.qualifiedPlantLocation));
  private readonly yearsOfExperienceControl = computed(() => this.getValueFormControl(EMaterialsFormControls.yearsOfExperience));
  private readonly totalQuantitiesControl = computed(() => this.getValueFormControl(EMaterialsFormControls.totalQuantities));

  private readonly mfg = () => this.planStore.productPlanData()?.productPlan.productPlantOverview.manufacturingExperience;

  private yesNo(value: boolean | null | undefined): string {
    if (value === true) return this.i18nService.translate('common.yes');
    if (value === false) return this.i18nService.translate('common.no');
    return '';
  }

  private formatProductManufacturingExperience(value: number | unknown): string {
    if (value === null || value === undefined || value === '') return '';

    const keyMap: Record<number, string> = {
      [EProductManufacturingExperience.Years_5]: 'plans.form.experienceLessThan5',
      [EProductManufacturingExperience.Years_5_10]: 'plans.form.experience5To10',
      [EProductManufacturingExperience.Years_10]: 'plans.form.experienceMoreThan10',
    };

    const key = keyMap[value as number];
    return key ? this.i18nService.translate(key) : String(value);
  }

  productManufacturingExperienceSummaryField = computed<IPlanSummaryField>(() => {
    this.i18nService.currentLanguage();
    this.doRefresh();
    const value = this.productManufacturingExperienceControl()?.value;
    const currantValue = this.formatProductManufacturingExperience(value);
    const beforeValue = this.formatProductManufacturingExperience(this.mfg()?.experienceRange);
    return {
      label: this.i18nService.translate('plans.form.productManufacturingExperience'),
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.productManufacturingExperienceControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.productManufacturingExperience),
      isResolved: this.isResolvedField(EMaterialsFormControls.productManufacturingExperience),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  provideToSECSummaryField = computed<IPlanSummaryField>(() => {
    this.i18nService.currentLanguage();
    this.doRefresh();
    const currantValue = this.yesNo(this.provideToSECControl()?.value);
    const beforeValue = this.yesNo(this.mfg()?.provideToSEC);
    return {
      label: this.i18nService.translate('plans.form.doYouProvideProductToSEC'),
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.provideToSECControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.provideToSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.provideToSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  showProvideToSECSummaryField = computed(() => {
    return this.provideToSECControl()?.value === true;
  });

  qualifiedPlantLocationSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.qualifiedPlantLocationSECControl()?.value ?? '';
    const beforeValue = this.mfg()?.qualifiedPlantLocation_SEC ?? '';
    return {
      label: this.i18nService.translate('plans.form.qualifiedPlantLocationBySEC'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.qualifiedPlantLocationSECControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.qualifiedPlantLocationSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.qualifiedPlantLocationSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  approvedVendorIDSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.approvedVendorIDSECControl()?.value ?? '0';
    const beforeValue = this.mfg()?.approvedVendorId_SEC ?? '0';
    return {
      label: this.i18nService.translate('plans.form.approvedVendorIDWithSEC'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.approvedVendorIDSECControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.approvedVendorIDSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.approvedVendorIDSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  yearsOfExperienceSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.yearsOfExperienceSECControl()?.value ?? '0';
    const beforeValue = this.mfg()?.yearsExperience_SEC?.toString() || '0';
    return {
      label: this.i18nService.translate('plans.form.yearsOfExperienceWithSEC'),
      beforeValue,
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.yearsOfExperienceSECControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.yearsOfExperienceSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.yearsOfExperienceSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  totalQuantitiesSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();

    const currantValue = Number(this.totalQuantitiesSECControl()?.value ?? '0')
      .toLocaleString('en-US');

    const beforeValue = Number(this.mfg()?.totalQuantitiesToSEC ?? 0)
      .toLocaleString('en-US');
    return {
      label: this.i18nService.translate('plans.form.totalQuantitiesProvidedToSEC'),
      beforeValue,
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.totalQuantitiesSECControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.totalQuantitiesSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.totalQuantitiesSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  showApprovedLocalSuppliersSummaryField = computed(() => {
    return this.provideToLocalSuppliersControl()?.value === true;
  });

  provideToLocalSuppliersSummaryField = computed<IPlanSummaryField>(() => {
    this.i18nService.currentLanguage();
    this.doRefresh();
    const currantValue = this.yesNo(this.provideToLocalSuppliersControl()?.value);
    const beforeValue = this.yesNo(this.mfg()?.provideToLocalSuppliers);
    return {
      label: this.i18nService.translate('plans.form.doYouProvideProductToLocalSuppliers'),
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.provideToLocalSuppliersControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.provideToLocalSuppliers),
      isResolved: this.isResolvedField(EMaterialsFormControls.provideToLocalSuppliers),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  namesOfSECApprovedSuppliersSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.namesOfSECApprovedSuppliersControl()?.value ?? '';
    const beforeValue = this.mfg()?.localSupplierNames || '';
    return {
      label: this.i18nService.translate('plans.form.namesOfSECApprovedSuppliers'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.namesOfSECApprovedSuppliersControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.namesOfSECApprovedSuppliers),
      isResolved: this.isResolvedField(EMaterialsFormControls.namesOfSECApprovedSuppliers),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  qualifiedPlantLocationSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.qualifiedPlantLocationControl()?.value ?? '';
    const beforeValue = this.mfg()?.qualifiedPlantLocation_LocalSupplier || '';
    return {
      label: this.i18nService.translate('plans.form.qualifiedPlantLocation'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.qualifiedPlantLocationControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.qualifiedPlantLocation),
      isResolved: this.isResolvedField(EMaterialsFormControls.qualifiedPlantLocation),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  yearsOfExperienceSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.yearsOfExperienceControl()?.value ?? '0';
    const beforeValue = this.mfg()?.yearsExperience_LocalSupplier?.toString() || '0';
    return {
      label: this.i18nService.translate('plans.form.yearsOfExperience'),
      beforeValue,
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.yearsOfExperienceControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.yearsOfExperience),
      isResolved: this.isResolvedField(EMaterialsFormControls.yearsOfExperience),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  totalQuantitiesSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = Number(this.totalQuantitiesControl()?.value ?? '0')
      .toLocaleString('en-US');

    const beforeValue = Number(this.mfg()?.totalQuantitiesToLocalSuppliers ?? 0)
      .toLocaleString('en-US');
    return {
      label: this.i18nService.translate('plans.form.totalQuantitiesToLocalSuppliers'),
      beforeValue,
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.totalQuantitiesControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.totalQuantities),
      isResolved: this.isResolvedField(EMaterialsFormControls.totalQuantities),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
