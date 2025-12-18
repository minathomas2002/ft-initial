import { FormGroup, FormArray } from '@angular/forms';
import { ProductPlanFormService } from '../services/plan/materials-form-service/product-plan-form-service';
import {
  IProductLocalizationPlanRequest,
  ProductPlan,
  OverviewCompanyInfo,
  BasicInfo,
  CompanyInfo,
  LocationInfo,
  ProductPlantOverview,
  Overview,
  ExpectedCapex,
  TargetCustomers,
  ManufacturingExperience,
  ValueChainStep,
  ValueChainRow,
  Saudization,
  SaudizationRow,
  Attachment,
  Signature,
  ContactInfo
} from '../interfaces/plans.interface';
import { EMaterialsFormControls } from '../enums/product-localization-form-controls.enum';
import { IPhoneValue } from '../interfaces/phone-input.interface';

/**
 * Section type mapping for value chain sections
 */
const SECTION_TYPE_MAP: Record<string, number> = {
  [EMaterialsFormControls.designEngineeringFormGroup]: 1,
  [EMaterialsFormControls.sourcingFormGroup]: 2,
  [EMaterialsFormControls.manufacturingFormGroup]: 3,
  [EMaterialsFormControls.assemblyTestingFormGroup]: 4,
  [EMaterialsFormControls.afterSalesFormGroup]: 5,
};

/**
 * Saudization type mapping
 */
const SAUDIZATION_TYPE_MAP: Record<string, number> = {
  [EMaterialsFormControls.annualHeadcount]: 1,
  [EMaterialsFormControls.saudizationPercentage]: 2,
  [EMaterialsFormControls.annualTotalCompensation]: 3,
  [EMaterialsFormControls.saudiCompensationPercentage]: 4,
};

/**
 * Helper function to extract value from nested form control structure
 * Handles the {hasComment: boolean, value: any} pattern
 */
function getFormValue(formGroup: FormGroup | null, controlName: string): any {
  if (!formGroup) return null;
  const control = formGroup.get(controlName);
  if (!control) return null;

  if (control instanceof FormGroup) {
    const valueControl = control.get(EMaterialsFormControls.value);
    return valueControl?.value ?? null;
  }

  return control.value;
}

/**
 * Helper function to extract boolean value from form control
 */
function getFormBooleanValue(formGroup: FormGroup | null, controlName: string): boolean | null {
  if (!formGroup) return null;
  const control = formGroup.get(controlName);
  return control?.value ?? null;
}

/**
 * Map Step 1: Overview & Company Information
 */
function mapOverviewCompanyInfo(formService: ProductPlanFormService): OverviewCompanyInfo {
  const step1Form = formService.step1_overviewCompanyInformation;
  const basicInfoForm = formService.basicInformationFormGroup;
  const companyInfoForm = formService.companyInformationFormGroup;
  const locationInfoForm = formService.locationInformationFormGroup;
  const localAgentForm = formService.localAgentInformationFormGroup;

  const opportunityValue = getFormValue(basicInfoForm, EMaterialsFormControls.opportunity);
  const opportunityTypeValue = getFormValue(basicInfoForm, EMaterialsFormControls.opportunityType);
  const basicInfo: BasicInfo = {
    planTitle: getFormValue(basicInfoForm, EMaterialsFormControls.planTitle) ?? null,
    opportunityType: opportunityTypeValue ? parseInt(opportunityTypeValue, 10) : null,
    opportunityTilte: opportunityValue?.name ?? null,
    opportunityId: opportunityValue?.id ?? null,
  } as any; // Allow null values for FormData conversion

  const companyInfo: CompanyInfo = {
    companyName: getFormValue(companyInfoForm, EMaterialsFormControls.companyName) ?? null,
    ceoName: getFormValue(companyInfoForm, EMaterialsFormControls.ceoName) ?? null,
    ceoEmail: getFormValue(companyInfoForm, EMaterialsFormControls.ceoEmailID) ?? null,
  } as any; // Allow null values for FormData conversion

  const hasLocalAgent = getFormBooleanValue(locationInfoForm, EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA);

  // Combine phone code and number into one string
  const phoneValue = hasLocalAgent ? getFormValue(localAgentForm, EMaterialsFormControls.contactNumber) : null;
  let localAgentContactNumber: string | null = null;
  if (phoneValue && typeof phoneValue === 'object' && 'countryCode' in phoneValue && 'phoneNumber' in phoneValue) {
    const phone = phoneValue as IPhoneValue;
    if (phone.countryCode && phone.phoneNumber) {
      localAgentContactNumber = `${phone.countryCode}${phone.phoneNumber}`;
    } else if (phone.phoneNumber) {
      localAgentContactNumber = phone.phoneNumber;
    }
  } else if (phoneValue && typeof phoneValue === 'string') {
    localAgentContactNumber = phoneValue;
  }

  const locationInfo: LocationInfo = {
    globalHQLocation: getFormValue(locationInfoForm, EMaterialsFormControls.globalHQLocation) ?? null,
    vendorIdWithSEC: getFormValue(locationInfoForm, EMaterialsFormControls.registeredVendorIDwithSEC) ?? null,
    hasLocalAgent: hasLocalAgent ?? null,
    localAgentName: hasLocalAgent ? (getFormValue(localAgentForm, EMaterialsFormControls.localAgentName) ?? null) : null,
    contactPersonName: hasLocalAgent ? (getFormValue(localAgentForm, EMaterialsFormControls.contactPersonName) ?? null) : null,
    localAgentEmail: hasLocalAgent ? (getFormValue(localAgentForm, EMaterialsFormControls.emailID) ?? null) : null,
    localAgentContactNumber: hasLocalAgent ? localAgentContactNumber : null,
    companyHQLocation: hasLocalAgent ? (getFormValue(localAgentForm, EMaterialsFormControls.companyHQLocation) ?? null) : null,
  } as any; // Allow null values for FormData conversion

  return {
    basicInfo,
    companyInfo,
    locationInfo,
  };
}

/**
 * Map Step 2: Product & Plant Overview
 */
function mapProductPlantOverview(formService: ProductPlanFormService): ProductPlantOverview {
  const step2Form = formService.step2_productPlantOverview;
  const overviewForm = formService.overviewFormGroup;
  const capexForm = formService.expectedCAPEXInvestmentFormGroup;
  const targetCustomersForm = formService.targetCustomersFormGroup;
  const manufacturingExpForm = formService.productManufacturingExperienceFormGroup;

  const overview: Overview = {
    productName: getFormValue(overviewForm, EMaterialsFormControls.productName) ?? null,
    productSpecifications: getFormValue(overviewForm, EMaterialsFormControls.productSpecifications) ?? null,
    targetedAnnualPlantCapacity: getFormValue(overviewForm, EMaterialsFormControls.targetedAnnualPlantCapacity) ?? null,
    timeRequiredToSetupFactory: getFormValue(overviewForm, EMaterialsFormControls.timeRequiredToSetupFactory) ?? null,
  } as any; // Allow null values for FormData conversion

  const expectedCapex: ExpectedCapex = {
    landPercent: getFormValue(capexForm, EMaterialsFormControls.landPercentage) ?? null,
    buildingPercent: getFormValue(capexForm, EMaterialsFormControls.buildingPercentage) ?? null,
    machineryPercent: getFormValue(capexForm, EMaterialsFormControls.machineryEquipmentPercentage) ?? null,
    othersPercent: getFormValue(capexForm, EMaterialsFormControls.othersPercentage) ?? null,
    othersDescription: getFormValue(capexForm, EMaterialsFormControls.othersDescription) ?? null,
  } as any; // Allow null values for FormData conversion

  const targetedCustomers = getFormValue(targetCustomersForm, EMaterialsFormControls.targetedCustomer) as string[] | null;
  // Only set targetSEC to true/false if targetedCustomers is not null/undefined and is an array
  // If it's null/undefined, keep it as null. If it's an empty array, set to false.
  const targetSEC = targetedCustomers === null || targetedCustomers === undefined
    ? null
    : targetedCustomers
  const targetLocalSuppliers = targetedCustomers === null || targetedCustomers === undefined
    ? null
    : (targetedCustomers.length > 0 ? targetedCustomers.includes('2') : false);

  const targetCustomers: TargetCustomers = {
    targetSEC,
    targetLocalSuppliers,
    targetedLocalSupplierNames: getFormValue(targetCustomersForm, EMaterialsFormControls.namesOfTargetedSuppliers) ?? null,
    productsUtilizingTargetProduct: getFormValue(targetCustomersForm, EMaterialsFormControls.productsUtilizeTargetedProduct) ?? null,
  } as any; // Allow null values for FormData conversion

  const provideToSEC = getFormBooleanValue(manufacturingExpForm, EMaterialsFormControls.provideToSEC);
  const provideToLocalSuppliers = getFormBooleanValue(manufacturingExpForm, EMaterialsFormControls.provideToLocalSuppliers);

  const experienceRangeValue = getFormValue(manufacturingExpForm, EMaterialsFormControls.productManufacturingExperience);
  // Extract the id from the experience range value (should be a string that can be parsed to int)
  const experienceRangeId = experienceRangeValue?.id ?? experienceRangeValue ?? null;

  const manufacturingExperience: ManufacturingExperience = {
    experienceRange: experienceRangeId,
    provideToSEC: provideToSEC ?? null,
    qualifiedPlantLocation_SEC: provideToSEC ? (getFormValue(manufacturingExpForm, EMaterialsFormControls.qualifiedPlantLocationSEC) ?? null) : null,
    approvedVendorId_SEC: provideToSEC ? (getFormValue(manufacturingExpForm, EMaterialsFormControls.approvedVendorIDSEC) ?? null) : null,
    yearsExperience_SEC: provideToSEC ? (getFormValue(manufacturingExpForm, EMaterialsFormControls.yearsOfExperienceSEC) ?? null) : null,
    totalQuantitiesToSEC: provideToSEC ? (getFormValue(manufacturingExpForm, EMaterialsFormControls.totalQuantitiesSEC) ?? null) : null,
    provideToLocalSuppliers: provideToLocalSuppliers ?? null,
    localSupplierNames: provideToLocalSuppliers ? (getFormValue(manufacturingExpForm, EMaterialsFormControls.namesOfSECApprovedSuppliers) ?? null) : null,
    qualifiedPlantLocation_LocalSupplier: provideToLocalSuppliers ? (getFormValue(manufacturingExpForm, EMaterialsFormControls.qualifiedPlantLocation) ?? null) : null,
    yearsExperience_LocalSupplier: provideToLocalSuppliers ? (getFormValue(manufacturingExpForm, EMaterialsFormControls.yearsOfExperience) ?? null) : null,
    totalQuantitiesToLocalSuppliers: provideToLocalSuppliers ? (getFormValue(manufacturingExpForm, EMaterialsFormControls.totalQuantities) ?? null) : null,
  } as any; // Allow null values for FormData conversion

  return {
    overview,
    expectedCapex,
    targetCustomers,
    manufacturingExperience,
  };
}

/**
 * Map Step 3: Value Chain
 */
function mapValueChainStep(formService: ProductPlanFormService): ValueChainStep {
  const step3Form = formService.step3_valueChain;
  const valueChainRows: ValueChainRow[] = [];

  const sections = [
    EMaterialsFormControls.designEngineeringFormGroup,
    EMaterialsFormControls.sourcingFormGroup,
    EMaterialsFormControls.manufacturingFormGroup,
    EMaterialsFormControls.assemblyTestingFormGroup,
    EMaterialsFormControls.afterSalesFormGroup,
  ];

  sections.forEach((sectionName) => {
    const sectionFormGroup = step3Form.get(sectionName) as FormGroup;
    if (!sectionFormGroup) return;

    const itemsArray = sectionFormGroup.get('items') as FormArray;
    if (!itemsArray) return;

    const sectionType = SECTION_TYPE_MAP[sectionName] ?? 0;

    itemsArray.controls.forEach((itemControl) => {
      const itemFormGroup = itemControl as FormGroup;
      const expenseHeader = getFormValue(itemFormGroup, EMaterialsFormControls.expenseHeader);
      const inHouseOrProcured = getFormValue(itemFormGroup, EMaterialsFormControls.inHouseOrProcured);
      const costPercent = getFormValue(itemFormGroup, EMaterialsFormControls.costPercentage);

      // Only add row if it has at least an expense header
      if (expenseHeader) {
        valueChainRows.push({
          id: null,
          sectionType,
          expenseHeader: expenseHeader ?? null,
          inHouseOrProcured: inHouseOrProcured ?? null,
          costPercent: costPercent ?? null,
          year1: getFormValue(itemFormGroup, EMaterialsFormControls.year1) ?? null,
          year2: getFormValue(itemFormGroup, EMaterialsFormControls.year2) ?? null,
          year3: getFormValue(itemFormGroup, EMaterialsFormControls.year3) ?? null,
          year4: getFormValue(itemFormGroup, EMaterialsFormControls.year4) ?? null,
          year5: getFormValue(itemFormGroup, EMaterialsFormControls.year5) ?? null,
          year6: getFormValue(itemFormGroup, EMaterialsFormControls.year6) ?? null,
          year7: getFormValue(itemFormGroup, EMaterialsFormControls.year7) ?? null,
        } as any as ValueChainRow); // Allow null values for FormData conversion
      }
    });
  });

  // Calculate total localization percentage (sum of all year totals)
  // This is the value used in the beLess100 validator
  // Use the form service's calculateYearTotalLocalization method
  let valueChainSummary = '';
  try {
    let total = 0;
    for (let year = 1; year <= 7; year++) {
      const yearTotal = formService.calculateYearTotalLocalization(year);
      total += yearTotal;
    }
    valueChainSummary = total.toString();
  } catch (error) {
    // If calculation fails, leave as empty string
    valueChainSummary = '';
  }

  return {
    valueChainRows,
    valueChainSummary,
  } as any as ValueChainStep; // Allow null values for FormData conversion
}

/**
 * Map Step 4: Saudization
 */
function mapSaudization(formService: ProductPlanFormService): Saudization {
  const step4Form = formService.step4_saudization;
  const saudizationFormGroup = formService.saudizationFormGroup;
  const attachmentsFormGroup = formService.attachmentsFormGroup;

  const saudizationRows: SaudizationRow[] = [];

  if (saudizationFormGroup) {
    const rowTypes = [
      EMaterialsFormControls.annualHeadcount,
      EMaterialsFormControls.saudizationPercentage,
      EMaterialsFormControls.annualTotalCompensation,
      EMaterialsFormControls.saudiCompensationPercentage,
    ];

    rowTypes.forEach((rowType) => {
      const saudizationType = SAUDIZATION_TYPE_MAP[rowType] ?? null;
      const row = {
        id: null,
        year1: null,
        year2: null,
        year3: null,
        year4: null,
        year5: null,
        year6: null,
        year7: null,
        saudizationType,
      } as any as SaudizationRow; // Allow null values for FormData conversion

      // Extract values for each year
      for (let year = 1; year <= 7; year++) {
        const yearControl = `year${year}` as keyof typeof EMaterialsFormControls;
        const yearControlName = EMaterialsFormControls[yearControl];
        const yearFormGroup = saudizationFormGroup.get(yearControlName) as FormGroup;

        if (yearFormGroup) {
          const rowFormGroup = yearFormGroup.get(rowType) as FormGroup;
          if (rowFormGroup) {
            const value = getFormValue(rowFormGroup, EMaterialsFormControls.value);
            (row as any)[`year${year}`] = value ?? null;
          }
        }
      }

      saudizationRows.push(row);
    });
  }

  // Map attachments - files are stored as File[] in the form control
  const attachments: Attachment[] = [];
  if (attachmentsFormGroup) {
    const attachmentsValue = getFormValue(attachmentsFormGroup, EMaterialsFormControls.attachments);

    // Handle file attachments - files are File objects
    if (attachmentsValue && Array.isArray(attachmentsValue)) {
      attachmentsValue.forEach((file: File | any) => {
        if (file instanceof File) {
          // File object - store file reference (actual file will be appended in FormData)
          attachments.push({
            id: '',
            fileName: file.name,
            fileExtension: file.name.split('.').pop() ?? '',
            fileUrl: '',
            file: file as any as string, // Store File object reference, will be handled in FormData conversion
          } as any as Attachment);
        } else if (file && typeof file === 'object') {
          // Already processed attachment object
          attachments.push({
            id: file.id ?? '',
            fileName: file.name ?? file.fileName ?? '',
            fileExtension: file.name?.split('.').pop() ?? file.fileExtension ?? '',
            fileUrl: file.url ?? file.fileUrl ?? '',
            file: file.base64 ?? file.data ?? file.file ?? file,
          });
        }
      });
    }
  }

  return {
    saudizationRows,
    attachments,
  };
}

/**
 * Create a placeholder signature structure
 */
function createPlaceholderSignature(): Signature {
  return {
    id: '',
    signatureValue: '',
    contactInfo: {
      name: '',
      jobTitle: '',
      contactNumber: '',
      emailId: '',
    },
  };
}

/**
 * Main mapper function: Convert form values to IProductLocalizationPlanRequest
 */
export function mapProductLocalizationPlanFormToRequest(
  formService: ProductPlanFormService,
  planId: string = ''
): IProductLocalizationPlanRequest {
  const productPlan: ProductPlan = {
    id: planId,
    overviewCompanyInfo: mapOverviewCompanyInfo(formService),
    productPlantOverview: mapProductPlantOverview(formService),
    valueChainStep: mapValueChainStep(formService),
    saudization: mapSaudization(formService),
  };

  const signature = createPlaceholderSignature();

  return {
    productPlan,
    signature,
  };
}

/**
 * Helper function to append value to FormData, handling null/undefined
 * All fields are nullable, so null values are explicitly appended as "null"
 */
function appendFormDataValue(formData: FormData, key: string, value: any): void {
  if (value === undefined) {
    // Skip undefined values
    return;
  }

  if (value === null) {
    // Append null as the string "null"
    formData.append(key, 'null');
  } else if (typeof value === 'boolean') {
    formData.append(key, value ? 'true' : 'false');
  } else if (typeof value === 'number') {
    formData.append(key, value.toString());
  } else {
    // For strings, only skip empty strings if they're not explicitly set
    formData.append(key, value);
  }
}

/**
 * Convert IProductLocalizationPlanRequest to FormData using dot notation as per Swagger spec
 */
export function convertRequestToFormData(request: IProductLocalizationPlanRequest): FormData {
  const formData = new FormData();
  const { productPlan } = request;

  // ProductPlan.Id
  appendFormDataValue(formData, 'ProductPlan.Id', productPlan.id);

  // BasicInfo
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.BasicInfo.PlanTitle', productPlan.overviewCompanyInfo.basicInfo.planTitle);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.BasicInfo.OpportunityType', productPlan.overviewCompanyInfo.basicInfo.opportunityType);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.BasicInfo.OpportunityTitle', productPlan.overviewCompanyInfo.basicInfo.opportunityTilte);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.BasicInfo.OpportunityId', productPlan.overviewCompanyInfo.basicInfo.opportunityId);

  // CompanyInfo
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.CompanyInfo.CompanyName', productPlan.overviewCompanyInfo.companyInfo.companyName);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.CompanyInfo.CEOName', productPlan.overviewCompanyInfo.companyInfo.ceoName);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.CompanyInfo.CEOEmail', productPlan.overviewCompanyInfo.companyInfo.ceoEmail);

  // LocationInfo
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.LocationInfo.GlobalHQLocation', productPlan.overviewCompanyInfo.locationInfo.globalHQLocation);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.LocationInfo.VendorIdWithSEC', productPlan.overviewCompanyInfo.locationInfo.vendorIdWithSEC);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.LocationInfo.HasLocalAgent', productPlan.overviewCompanyInfo.locationInfo.hasLocalAgent);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.LocationInfo.LocalAgentName', productPlan.overviewCompanyInfo.locationInfo.localAgentName);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.LocationInfo.ContactPersonName', productPlan.overviewCompanyInfo.locationInfo.contactPersonName);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.LocationInfo.LocalAgentEmail', productPlan.overviewCompanyInfo.locationInfo.localAgentEmail);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.LocationInfo.LocalAgentContactNumber', productPlan.overviewCompanyInfo.locationInfo.localAgentContactNumber);
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.LocationInfo.CompanyHQLocation', productPlan.overviewCompanyInfo.locationInfo.companyHQLocation);

  // Overview
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.Overview.ProductName', productPlan.productPlantOverview.overview.productName);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.Overview.ProductSpecifications', productPlan.productPlantOverview.overview.productSpecifications);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.Overview.TargetedAnnualPlantCapacity', productPlan.productPlantOverview.overview.targetedAnnualPlantCapacity);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.Overview.TimeRequiredToSetupFactory', productPlan.productPlantOverview.overview.timeRequiredToSetupFactory);

  // ExpectedCapex
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ExpectedCapex.LandPercent', productPlan.productPlantOverview.expectedCapex.landPercent);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ExpectedCapex.BuildingPercent', productPlan.productPlantOverview.expectedCapex.buildingPercent);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ExpectedCapex.MachineryPercent', productPlan.productPlantOverview.expectedCapex.machineryPercent);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ExpectedCapex.OthersPercent', productPlan.productPlantOverview.expectedCapex.othersPercent);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ExpectedCapex.OthersDescription', productPlan.productPlantOverview.expectedCapex.othersDescription);

  // TargetCustomers - Convert boolean to integer for API (null stays null)
  const targetSECValue = productPlan.productPlantOverview.targetCustomers.targetSEC;
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.TargetCustomers.TargetSEC', targetSECValue);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.TargetCustomers.TargetedLocalSupplierNames', productPlan.productPlantOverview.targetCustomers.targetedLocalSupplierNames);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.TargetCustomers.ProductsUtilizingTargetProduct', productPlan.productPlantOverview.targetCustomers.productsUtilizingTargetProduct);

  // ManufacturingExperience - Convert string to integer for API (null stays null)
  const experienceRangeValue = productPlan.productPlantOverview.manufacturingExperience.experienceRange;
  const experienceRangeInt = experienceRangeValue === null ? null : parseInt(experienceRangeValue, 10);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.ExperienceRange', experienceRangeInt);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.ProvideToSEC', productPlan.productPlantOverview.manufacturingExperience.provideToSEC);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.QualifiedPlantLocation_SEC', productPlan.productPlantOverview.manufacturingExperience.qualifiedPlantLocation_SEC);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.ApprovedVendorId_SEC', productPlan.productPlantOverview.manufacturingExperience.approvedVendorId_SEC);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.YearsExperience_SEC', productPlan.productPlantOverview.manufacturingExperience.yearsExperience_SEC);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.TotalQuantitiesToSEC', productPlan.productPlantOverview.manufacturingExperience.totalQuantitiesToSEC);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.ProvideToLocalSuppliers', productPlan.productPlantOverview.manufacturingExperience.provideToLocalSuppliers);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.LocalSupplierNames', productPlan.productPlantOverview.manufacturingExperience.localSupplierNames);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.QualifiedPlantLocation_LocalSupplier', productPlan.productPlantOverview.manufacturingExperience.qualifiedPlantLocation_LocalSupplier);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.YearsExperience_LocalSupplier', productPlan.productPlantOverview.manufacturingExperience.yearsExperience_LocalSupplier);
  appendFormDataValue(formData, 'ProductPlan.ProductPlantOverview.ManufacturingExperience.TotalQuantitiesToLocalSuppliers', productPlan.productPlantOverview.manufacturingExperience.totalQuantitiesToLocalSuppliers);

  // ValueChainStep
  appendFormDataValue(formData, 'ProductPlan.ValueChainStep.ValueChainSummary', productPlan.valueChainStep.valueChainSummary);

  // ValueChainRows - append each row
  if (productPlan.valueChainStep.valueChainRows && productPlan.valueChainStep.valueChainRows.length > 0) {
    productPlan.valueChainStep.valueChainRows.forEach((row, index) => {
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].Id`, row.id);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].SectionType`, row.sectionType);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].ExpenseHeader`, row.expenseHeader);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].InHouseOrProcured`, row.inHouseOrProcured);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].CostPercent`, row.costPercent);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].Year1`, row.year1);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].Year2`, row.year2);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].Year3`, row.year3);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].Year4`, row.year4);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].Year5`, row.year5);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].Year6`, row.year6);
      appendFormDataValue(formData, `ProductPlan.ValueChainStep.ValueChainRows[${index}].Year7`, row.year7);
    });
  }

  // SaudizationRows - append each row
  if (productPlan.saudization.saudizationRows && productPlan.saudization.saudizationRows.length > 0) {
    productPlan.saudization.saudizationRows.forEach((row, index) => {
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].Id`, row.id);
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].SaudizationType`, row.saudizationType);
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].Year1`, row.year1);
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].Year2`, row.year2);
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].Year3`, row.year3);
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].Year4`, row.year4);
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].Year5`, row.year5);
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].Year6`, row.year6);
      appendFormDataValue(formData, `ProductPlan.Saudization.SaudizationRows[${index}].Year7`, row.year7);
    });
  }

  // Attachments - append files
  if (productPlan.saudization.attachments && productPlan.saudization.attachments.length > 0) {
    productPlan.saudization.attachments.forEach((attachment, index) => {
      const fileValue: any = attachment.file;

      if (!fileValue) return;

      // Check if it's a File object
      if (fileValue instanceof File) {
        // File object - append directly
        formData.append(`ProductPlan.Saudization.Attachments[${index}]`, fileValue);
      } else if (typeof fileValue === 'object' && 'size' in fileValue && 'type' in fileValue && 'name' in fileValue) {
        // Duck typing for File-like object
        formData.append(`ProductPlan.Saudization.Attachments[${index}]`, fileValue as File);
      } else if (typeof fileValue === 'string') {
        // If file is base64 string, convert to blob
        if (fileValue.startsWith('data:')) {
          // Base64 data URL
          const base64Data = fileValue.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const mimeType = fileValue.match(/data:([^;]+);/)?.[1] || 'application/octet-stream';
          const blob = new Blob([byteArray], { type: mimeType });
          formData.append(`ProductPlan.Saudization.Attachments[${index}]`, blob, attachment.fileName);
        } else {
          // Plain base64 string
          const byteCharacters = atob(fileValue);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray]);
          formData.append(`ProductPlan.Saudization.Attachments[${index}]`, blob, attachment.fileName);
        }
      }
    });
  }

  return formData;
}
