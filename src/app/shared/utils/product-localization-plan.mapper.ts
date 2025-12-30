import { FormGroup, FormArray } from '@angular/forms';
import { ProductPlanFormService } from '../services/plan/materials-form-service/product-plan-form-service';
import {
  IProductLocalizationPlanRequest,
  IProductPlanResponse,
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
import { ELocalizationStatusType, ETargetedCustomer, EOpportunityType } from '../enums';
import { API_ENDPOINTS } from '../api/api-endpoints';
import { parsePhoneNumber } from '../data/countries.data';

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
 * Helper function to get MIME type from file extension
 */
function getMimeTypeFromExtension(extension: string | null | undefined): string {
  if (!extension) return 'application/octet-stream';

  const ext = extension.toLowerCase().replace('.', '');
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'csv': 'text/csv',
  };

  return mimeTypes[ext] || 'application/octet-stream';
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
    opportunityTitle: opportunityValue?.name ?? null,
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
  // targetSEC should be an array of ETargetedCustomer enum values
  // Convert string array to number array (ETargetedCustomer enum values)
  const targetSEC: ETargetedCustomer[] | null = targetedCustomers === null || targetedCustomers === undefined
    ? null
    : targetedCustomers.map(customer => parseInt(customer, 10) as ETargetedCustomer);
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

      // Get the row ID if it exists (for edit mode)
      const rowIdControl = itemFormGroup.get('rowId');
      const rowId = rowIdControl?.value ?? null;

      // Only add row if it has at least an expense header
      if (expenseHeader) {
        valueChainRows.push({
          id: rowId,
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
  const valueChainSummary = {
    year1: 0,
    year2: 0,
    year3: 0,
    year4: 0,
    year5: 0,
    year6: 0,
    year7: 0,
  };
  for (let year = 1; year <= 7; year++) {
    const yearKey = `year${year}` as keyof typeof valueChainSummary;
    const yearTotal = formService.calculateYearTotalLocalization(year);
    valueChainSummary[yearKey] = yearTotal;
  }


  return {
    valueChainRows,
    valueChainSummary: JSON.stringify(valueChainSummary),
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

      // Extract values for each year and get row ID (same for all years)
      let rowId: string | null = null;
      for (let year = 1; year <= 7; year++) {
        const yearControl = `year${year}` as keyof typeof EMaterialsFormControls;
        const yearControlName = EMaterialsFormControls[yearControl];
        const yearFormGroup = saudizationFormGroup.get(yearControlName) as FormGroup;

        if (yearFormGroup) {
          const rowFormGroup = yearFormGroup.get(rowType) as FormGroup;
          if (rowFormGroup) {
            // Get the row ID from the first year (it's the same for all years)
            if (year === 1) {
              const rowIdControl = rowFormGroup.get('rowId');
              rowId = rowIdControl?.value ?? null;
            }

            const value = getFormValue(rowFormGroup, EMaterialsFormControls.value);
            (row as any)[`year${year}`] = value ?? null;
          }
        }
      }

      // Set the row ID (can be null for new rows in edit mode)
      (row as any).id = rowId;

      saudizationRows.push(row);
    });
  }

  // Map attachments - files are stored as File[] or Attachment[] in the form control
  const attachments: Attachment[] = [];
  if (attachmentsFormGroup) {
    const attachmentsValue = getFormValue(attachmentsFormGroup, EMaterialsFormControls.attachments);

    // Handle file attachments - files can be File objects or Attachment objects
    if (attachmentsValue && Array.isArray(attachmentsValue)) {
      attachmentsValue.forEach((file: File | any) => {
        if (file instanceof File) {
          // File object - could be new file or existing attachment converted to File
          // Check if it has attachment metadata (from existing attachments)
          const existingFile = file as any;
          const attachmentId = existingFile.id || '';
          const isExistingAttachment = existingFile.isExistingAttachment === true;

          const fileName = file.name;
          const fileExtension = existingFile.fileExtension || (fileName.split('.').pop() ?? '');
          const fileUrl = existingFile.fileUrl || '';

          attachments.push({
            id: attachmentId, // Preserve ID if it's an existing attachment
            fileName: fileName,
            fileExtension: fileExtension,
            fileUrl: fileUrl,
            // For existing attachments without file changes, we might not need to send the file again
            // But if the file was replaced, we need to send the new File object
            file: isExistingAttachment && !existingFile.file ? '' : (file as any as string), // Store File object reference temporarily, will be handled in FormData conversion
          } as Attachment);
        } else if (file && typeof file === 'object') {
          // Already processed attachment object (from edit mode or existing attachments)
          // Ensure all Attachment interface fields are properly mapped
          const fileName = file.fileName ?? file.name ?? '';
          const fileExtension = file.fileExtension ?? (fileName ? fileName.split('.').pop() ?? '' : '');

          attachments.push({
            id: file.id ?? '',
            fileName: fileName,
            fileExtension: fileExtension,
            fileUrl: file.fileUrl ?? file.url ?? '',
            file: file.file ?? file.base64 ?? file.data ?? '',
          } as Attachment);
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
 * Helper function to set value in a FormGroup with hasComment/value pattern
 */
function setFormGroupValue(formGroup: FormGroup | null, controlName: string, value: any): void {
  if (!formGroup) return;
  const control = formGroup.get(controlName);
  if (control instanceof FormGroup) {
    const valueControl = control.get(EMaterialsFormControls.value);
    if (valueControl) {
      valueControl.setValue(value ?? '');
    }
  }
}

/**
 * Helper function to set phone number value (handles string format)
 */
function setPhoneValue(formGroup: FormGroup | null, controlName: string, phoneString: string | null): void {
  if (!formGroup || !phoneString) return;
  const control = formGroup.get(controlName);
  if (control instanceof FormGroup) {
    const valueControl = control.get(EMaterialsFormControls.value);
    if (valueControl) {
      // Try to parse phone string (format: countryCode+number or just number)
      // For now, set as string - components can handle parsing
      valueControl.setValue(parsePhoneNumber(phoneString));
    }
  }
}

/**
 * Map API response to form structure
 */
export function mapProductPlanResponseToForm(
  response: IProductPlanResponse,
  formService: ProductPlanFormService
): void {
  const { productPlan, signature } = response;

  // Step 1: Overview & Company Information
  const step1Form = formService.step1_overviewCompanyInformation;
  const basicInfoForm = formService.basicInformationFormGroup;
  const companyInfoForm = formService.companyInformationFormGroup;
  const locationInfoForm = formService.locationInformationFormGroup;
  const localAgentForm = formService.localAgentInformationFormGroup;

  // Basic Info
  if (basicInfoForm && productPlan.overviewCompanyInfo?.basicInfo) {
    const basicInfo = productPlan.overviewCompanyInfo.basicInfo;
    basicInfoForm.get(EMaterialsFormControls.planTitle)?.setValue(basicInfo.planTitle ?? '');
    basicInfoForm.get(EMaterialsFormControls.opportunityType)?.setValue(basicInfo.opportunityType?.toString() ?? EOpportunityType.PRODUCT.toString());

    // Set opportunity object (needs to match the select item format)
    if (basicInfo.opportunityId && basicInfo.opportunityTitle) {
      basicInfoForm.get(EMaterialsFormControls.opportunity)?.setValue({
        id: basicInfo.opportunityId,
        name: basicInfo.opportunityTitle
      });
    }

    // Set submissionDate from creationDate if available (for view/edit mode)
    const submissionDateControl = basicInfoForm.get(EMaterialsFormControls.submissionDate);
    if (submissionDateControl) {
      // Check if creationDate exists in productPlan (it might be at the productPlan level)
      const creationDate = new Date(productPlan.overviewCompanyInfo.basicInfo.createdDate);
      if (creationDate) {
        // Convert creationDate string to Date object if needed
        const dateValue = creationDate instanceof Date ? creationDate : new Date(creationDate);
        submissionDateControl.setValue(dateValue);
      }
    }
  }

  // Company Info
  if (companyInfoForm && productPlan.overviewCompanyInfo?.companyInfo) {
    const companyInfo = productPlan.overviewCompanyInfo.companyInfo;
    setFormGroupValue(companyInfoForm, EMaterialsFormControls.companyName, companyInfo.companyName);
    setFormGroupValue(companyInfoForm, EMaterialsFormControls.ceoName, companyInfo.ceoName);
    setFormGroupValue(companyInfoForm, EMaterialsFormControls.ceoEmailID, companyInfo.ceoEmail);
  }

  // Location Info
  if (locationInfoForm && productPlan.overviewCompanyInfo?.locationInfo) {
    const locationInfo = productPlan.overviewCompanyInfo.locationInfo;
    setFormGroupValue(locationInfoForm, EMaterialsFormControls.globalHQLocation, locationInfo.globalHQLocation);
    setFormGroupValue(locationInfoForm, EMaterialsFormControls.registeredVendorIDwithSEC, locationInfo.vendorIdWithSEC);
    locationInfoForm.get(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA)?.setValue(locationInfo.hasLocalAgent ?? null);

    // Toggle local agent validation based on hasLocalAgent
    if (locationInfo.hasLocalAgent !== undefined) {
      formService.toggleLocalAgentInformValidation(locationInfo.hasLocalAgent);
    }

    debugger;
    // Local Agent Info (only if hasLocalAgent is true)
    if (locationInfo.hasLocalAgent && localAgentForm) {
      setFormGroupValue(localAgentForm, EMaterialsFormControls.localAgentName, locationInfo.localAgentName);
      setFormGroupValue(localAgentForm, EMaterialsFormControls.contactPersonName, locationInfo.contactPersonName);
      setFormGroupValue(localAgentForm, EMaterialsFormControls.emailID, locationInfo.localAgentEmail);
      setPhoneValue(localAgentForm, EMaterialsFormControls.contactNumber, locationInfo.localAgentContactNumber);
      setFormGroupValue(localAgentForm, EMaterialsFormControls.companyHQLocation, locationInfo.companyHQLocation);
    }
  }

  // Step 2: Product & Plant Overview
  const step2Form = formService.step2_productPlantOverview;
  const overviewForm = formService.overviewFormGroup;
  const capexForm = formService.expectedCAPEXInvestmentFormGroup;
  const targetCustomersForm = formService.targetCustomersFormGroup;
  const manufacturingExpForm = formService.productManufacturingExperienceFormGroup;

  // Overview
  if (overviewForm && productPlan.productPlantOverview?.overview) {
    const overview = productPlan.productPlantOverview.overview;
    setFormGroupValue(overviewForm, EMaterialsFormControls.productName, overview.productName);
    setFormGroupValue(overviewForm, EMaterialsFormControls.productSpecifications, overview.productSpecifications);
    setFormGroupValue(overviewForm, EMaterialsFormControls.targetedAnnualPlantCapacity, overview.targetedAnnualPlantCapacity);
    setFormGroupValue(overviewForm, EMaterialsFormControls.timeRequiredToSetupFactory, overview.timeRequiredToSetupFactory);
  }

  // Expected CAPEX
  if (capexForm && productPlan.productPlantOverview?.expectedCapex) {
    const capex = productPlan.productPlantOverview.expectedCapex;
    setFormGroupValue(capexForm, EMaterialsFormControls.landPercentage, capex.landPercent);
    setFormGroupValue(capexForm, EMaterialsFormControls.buildingPercentage, capex.buildingPercent);
    setFormGroupValue(capexForm, EMaterialsFormControls.machineryEquipmentPercentage, capex.machineryPercent);
    setFormGroupValue(capexForm, EMaterialsFormControls.othersPercentage, capex.othersPercent);
    setFormGroupValue(capexForm, EMaterialsFormControls.othersDescription, capex.othersDescription);
  }

  // Target Customers
  if (targetCustomersForm && productPlan.productPlantOverview?.targetCustomers) {
    const targetCustomers = productPlan.productPlantOverview.targetCustomers;
    // Convert targetSEC array to string array for form
    const targetSECArray = targetCustomers.targetSEC?.map(sec => sec.toString()) ?? [];
    // If targetLocalSuppliers is true, add '2' to the array
    if (targetCustomers.targetLocalSuppliers) {
      if (!targetSECArray.includes('2')) {
        targetSECArray.push('2');
      }
    }
    // Set value on the nested 'value' control within the targetedCustomer FormGroup
    const targetedCustomerControl = targetCustomersForm.get(EMaterialsFormControls.targetedCustomer);
    if (targetedCustomerControl instanceof FormGroup) {
      const valueControl = targetedCustomerControl.get(EMaterialsFormControls.value);
      if (valueControl) {
        valueControl.setValue(targetSECArray ?? []);
      }
    }
    setFormGroupValue(targetCustomersForm, EMaterialsFormControls.namesOfTargetedSuppliers, targetCustomers.targetedLocalSupplierNames);
    setFormGroupValue(targetCustomersForm, EMaterialsFormControls.productsUtilizeTargetedProduct, targetCustomers.productsUtilizingTargetProduct);
  }

  // Manufacturing Experience
  if (manufacturingExpForm && productPlan.productPlantOverview?.manufacturingExperience) {
    const mfgExp = productPlan.productPlantOverview.manufacturingExperience;
    // Set experience range (should be a string to match option id format)
    if (mfgExp.experienceRange !== null && mfgExp.experienceRange !== undefined) {
      // Convert to string to match the option id format (options use id: EExperienceRange.Years_5.toString())
      const expValue = String(mfgExp.experienceRange);
      // Set value on the nested 'value' control within the productManufacturingExperience FormGroup
      const experienceControl = manufacturingExpForm.get(EMaterialsFormControls.productManufacturingExperience);
      if (experienceControl instanceof FormGroup) {
        const valueControl = experienceControl.get(EMaterialsFormControls.value);
        if (valueControl) {
          valueControl.setValue(expValue);
        }
      }
    }

    manufacturingExpForm.get(EMaterialsFormControls.provideToSEC)?.setValue(mfgExp.provideToSEC ?? false);
    manufacturingExpForm.get(EMaterialsFormControls.provideToLocalSuppliers)?.setValue(mfgExp.provideToLocalSuppliers ?? false);

    // Toggle validations
    if (mfgExp.provideToSEC !== undefined) {
      formService.toggleSECFieldsValidation(mfgExp.provideToSEC);
    }
    if (mfgExp.provideToLocalSuppliers !== undefined) {
      formService.toggleLocalSuppliersFieldsValidation(mfgExp.provideToLocalSuppliers);
    }

    // SEC fields
    if (mfgExp.provideToSEC) {
      setFormGroupValue(manufacturingExpForm, EMaterialsFormControls.qualifiedPlantLocationSEC, mfgExp.qualifiedPlantLocation_SEC);
      setFormGroupValue(manufacturingExpForm, EMaterialsFormControls.approvedVendorIDSEC, mfgExp.approvedVendorId_SEC);
      setFormGroupValue(manufacturingExpForm, EMaterialsFormControls.yearsOfExperienceSEC, mfgExp.yearsExperience_SEC);
      setFormGroupValue(manufacturingExpForm, EMaterialsFormControls.totalQuantitiesSEC, mfgExp.totalQuantitiesToSEC);
    }

    // Local Suppliers fields
    if (mfgExp.provideToLocalSuppliers) {
      setFormGroupValue(manufacturingExpForm, EMaterialsFormControls.namesOfSECApprovedSuppliers, mfgExp.localSupplierNames);
      setFormGroupValue(manufacturingExpForm, EMaterialsFormControls.qualifiedPlantLocation, mfgExp.qualifiedPlantLocation_LocalSupplier);
      setFormGroupValue(manufacturingExpForm, EMaterialsFormControls.yearsOfExperience, mfgExp.yearsExperience_LocalSupplier);
      setFormGroupValue(manufacturingExpForm, EMaterialsFormControls.totalQuantities, mfgExp.totalQuantitiesToLocalSuppliers);
    }
  }

  // Step 3: Value Chain
  const step3Form = formService.step3_valueChain;
  if (step3Form && productPlan.valueChainStep?.valueChainRows) {
    const valueChainRows = productPlan.valueChainStep.valueChainRows;

    // Group rows by section type
    const rowsBySection: Record<number, ValueChainRow[]> = {};
    valueChainRows.forEach(row => {
      if (!rowsBySection[row.sectionType]) {
        rowsBySection[row.sectionType] = [];
      }
      rowsBySection[row.sectionType].push(row);
    });

    // Map section types to form group names
    const sectionMap: Record<number, string> = {
      1: EMaterialsFormControls.designEngineeringFormGroup,
      2: EMaterialsFormControls.sourcingFormGroup,
      3: EMaterialsFormControls.manufacturingFormGroup,
      4: EMaterialsFormControls.assemblyTestingFormGroup,
      5: EMaterialsFormControls.afterSalesFormGroup,
    };

    // Populate each section
    Object.keys(rowsBySection).forEach(sectionTypeStr => {
      const sectionType = parseInt(sectionTypeStr, 10);
      const sectionName = sectionMap[sectionType];
      if (!sectionName) return;

      const sectionFormGroup = step3Form.get(sectionName) as FormGroup;
      if (!sectionFormGroup) return;

      const itemsArray = sectionFormGroup.get('items') as FormArray;
      if (!itemsArray) return;

      // Clear existing items
      while (itemsArray.length > 0) {
        itemsArray.removeAt(0);
      }

      // Add rows
      rowsBySection[sectionType].forEach(row => {
        const itemFormGroup = formService.createValueChainItem();
        // Store the row ID for edit mode
        const rowIdControl = itemFormGroup.get('rowId');
        if (rowIdControl && row.id) {
          rowIdControl.setValue(row.id);
        }
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.expenseHeader, row.expenseHeader);
        // Convert numeric values to strings to match select option IDs (which use .toString() on enum values)
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.inHouseOrProcured, row.inHouseOrProcured != null ? String(row.inHouseOrProcured) : null);
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.costPercentage, row.costPercent);
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.year1, row.year1 != null ? String(row.year1) : null);
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.year2, row.year2 != null ? String(row.year2) : null);
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.year3, row.year3 != null ? String(row.year3) : null);
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.year4, row.year4 != null ? String(row.year4) : null);
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.year5, row.year5 != null ? String(row.year5) : null);
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.year6, row.year6 != null ? String(row.year6) : null);
        setFormGroupValue(itemFormGroup, EMaterialsFormControls.year7, row.year7 != null ? String(row.year7) : null);
        itemsArray.push(itemFormGroup);
      });
    });
  }

  // Step 4: Saudization
  const step4Form = formService.step4_saudization;
  const saudizationFormGroup = formService.saudizationFormGroup;

  if (saudizationFormGroup && productPlan.saudization?.saudizationRows) {
    const saudizationRows = productPlan.saudization.saudizationRows;

    // Group rows by saudization type
    const rowsByType: Record<number, SaudizationRow> = {};
    saudizationRows.forEach(row => {
      rowsByType[row.saudizationType] = row;
    });

    // Map saudization types to row names
    const typeMap: Record<number, string> = {
      1: EMaterialsFormControls.annualHeadcount,
      2: EMaterialsFormControls.saudizationPercentage,
      3: EMaterialsFormControls.annualTotalCompensation,
      4: EMaterialsFormControls.saudiCompensationPercentage,
    };

    // Populate each year
    for (let year = 1; year <= 7; year++) {
      const yearFormGroup = formService.getYearFormGroup(year);
      if (!yearFormGroup) continue;

      Object.keys(rowsByType).forEach(typeStr => {
        const type = parseInt(typeStr, 10);
        const rowName = typeMap[type];
        if (!rowName) return;

        const row = rowsByType[type];
        const rowFormGroup = yearFormGroup.get(rowName) as FormGroup;
        if (rowFormGroup) {
          // Store the row ID for edit mode (same ID for all years of the same row type)
          const rowIdControl = rowFormGroup.get('rowId');
          if (rowIdControl && row.id) {
            rowIdControl.setValue(row.id);
          }

          const valueControl = rowFormGroup.get(EMaterialsFormControls.value);
          if (valueControl) {
            const yearValue = (row as any)[`year${year}`];
            valueControl.setValue(yearValue ?? null);
          }
        }
      });
    }
  }

  // Attachments
  const attachmentsFormGroup = formService.attachmentsFormGroup;
  if (attachmentsFormGroup && productPlan.saudization?.attachments) {
    const attachments = productPlan.saudization.attachments;
    const attachmentsControl = attachmentsFormGroup.get(EMaterialsFormControls.attachments);

    if (attachmentsControl instanceof FormGroup) {
      const valueControl = attachmentsControl.get(EMaterialsFormControls.value);
      if (valueControl && attachments.length > 0) {
        // Convert attachment objects to File-like objects that can be displayed
        const attachmentFiles = attachments.map(att => {
          // Create a File-like object that includes attachment metadata
          // We'll create an empty File object with the correct name and attach metadata
          const fileName = att.fileName + (att.fileExtension || '');
          const fileType = getMimeTypeFromExtension(att.fileExtension);

          // Create a File object (empty blob) with the correct name
          const blob = new Blob([], { type: fileType });
          const file = new File([blob], fileName, { type: fileType });

          // Construct full file URL if it's a relative path
          let fullFileUrl = att.fileUrl || '';
          if (fullFileUrl && !fullFileUrl.startsWith('http://') && !fullFileUrl.startsWith('https://')) {
            // Prepend base URL if it's a relative path
            const baseUrl = API_ENDPOINTS.baseUrl.replace('/api', ''); // Remove /api suffix if present
            fullFileUrl = baseUrl + (fullFileUrl.startsWith('/') ? fullFileUrl : '/' + fullFileUrl);
          }

          // Attach attachment metadata as additional properties
          (file as any).id = att.id;
          (file as any).fileUrl = fullFileUrl;
          (file as any).fileExtension = att.fileExtension;
          (file as any).isExistingAttachment = true;

          return file;
        });
        valueControl.setValue(attachmentFiles);
      }
    }
  }

  // Store signature if present (for later use in submission modal)
  if (signature && signature.signatureValue) {
    // Signature will be handled by the wizard component
    // Store it in a way that can be accessed later
  }
}

/**
 * Main mapper function: Convert form values to IProductLocalizationPlanRequest
 */
export function mapProductLocalizationPlanFormToRequest(
  formService: ProductPlanFormService,
  planId: string = '',
  signature?: Signature
): IProductLocalizationPlanRequest {
  const productPlan: ProductPlan = {
    id: planId,
    overviewCompanyInfo: mapOverviewCompanyInfo(formService),
    productPlantOverview: mapProductPlantOverview(formService),
    valueChainStep: mapValueChainStep(formService),
    saudization: mapSaudization(formService),
  };

  const signatureData = signature || createPlaceholderSignature();

  return {
    productPlan,
    signature: signatureData,
  };
}

/**
 * Helper function to append value to FormData, handling null/undefined
 * All fields are nullable, so null values are explicitly appended as "null"
 */
function appendFormDataValue(formData: FormData, key: string, value: any): void {
  if (value === undefined || value === null) {
    // Skip undefined and null values
    return;
  }

  if (Array.isArray(value)) {
    // Handle arrays - append each element with indexed key
    if (value.length === 0) {
      return;
    }

    value.forEach((item, index) => {
      if (item !== null && item !== undefined) {
        formData.append(`${key}[${index}]`, item.toString());
      }
    });
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? 'true' : 'false');
    return;
  }

  formData.append(key, value.toString());
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
  appendFormDataValue(formData, 'ProductPlan.OverviewCompanyInfo.BasicInfo.OpportunityTitle', productPlan.overviewCompanyInfo.basicInfo.opportunityTitle);
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

  // Attachments - append as structured objects with metadata and file
  if (productPlan.saudization.attachments && productPlan.saudization.attachments.length > 0) {
    productPlan.saudization.attachments.forEach((attachment, index) => {
      // Append attachment metadata fields as structured object properties
      appendFormDataValue(formData, `ProductPlan.Saudization.Attachments[${index}].Id`, attachment.id);
      appendFormDataValue(formData, `ProductPlan.Saudization.Attachments[${index}].FileName`, attachment.fileName);
      appendFormDataValue(formData, `ProductPlan.Saudization.Attachments[${index}].FileExtension`, attachment.fileExtension);
      appendFormDataValue(formData, `ProductPlan.Saudization.Attachments[${index}].FileUrl`, attachment.fileUrl);

      const fileValue: any = attachment.file;

      // Handle the file data
      if (fileValue) {
        // Check if it's a File object - append as binary with proper field name
        if (fileValue instanceof File) {
          // File object - append as binary with the structured field name
          formData.append(`ProductPlan.Saudization.Attachments[${index}].File`, fileValue);
        } else if (typeof fileValue === 'object' && 'size' in fileValue && 'type' in fileValue && 'name' in fileValue) {
          // Duck typing for File-like object - append as binary
          formData.append(`ProductPlan.Saudization.Attachments[${index}].File`, fileValue as File);
        } else if (typeof fileValue === 'string') {
          // If file is already a string (base64), append as string field
          let fileStringValue: string = '';
          if (fileValue.startsWith('data:')) {
            // Base64 data URL - extract the base64 part
            fileStringValue = fileValue.split(',')[1];
          } else if (fileValue.trim() !== '') {
            // Plain base64 string
            fileStringValue = fileValue;
          }
          // Append as string field (not binary)
          if (fileStringValue) {
            appendFormDataValue(formData, `ProductPlan.Saudization.Attachments[${index}].File`, fileStringValue);
          }
        }
      }
    });
  }

  // Signature
  const { signature } = request;
  if (signature) {
    appendFormDataValue(formData, 'Signature.Id', signature.id);
    appendFormDataValue(formData, 'Signature.SignatureValue', signature.signatureValue);

    if (signature.contactInfo) {
      appendFormDataValue(formData, 'Signature.ContactInfo.Name', signature.contactInfo.name);
      appendFormDataValue(formData, 'Signature.ContactInfo.JobTitle', signature.contactInfo.jobTitle);
      appendFormDataValue(formData, 'Signature.ContactInfo.ContactNumber', signature.contactInfo.contactNumber);
      appendFormDataValue(formData, 'Signature.ContactInfo.EmailId', signature.contactInfo.emailId);
    }
  }

  return formData;
}
