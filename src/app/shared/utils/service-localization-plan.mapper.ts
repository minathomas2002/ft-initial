import { FormGroup } from '@angular/forms';
import { ServicePlanFormService } from '../services/plan/service-plan-form-service/service-plan-form-service';
import { EMaterialsFormControls } from '../enums/product-localization-form-controls.enum';
import { Signature } from '../interfaces/plans.interface';
import { ELocalizationMethodology } from 'src/app/shared/enums';

/**
 * Interface definitions for Service Localization Plan API Request
 */
export interface IServiceLocalizationPlanRequest {
  servicePlan: ServicePlan;
  signature: Signature;
}

export interface ServicePlan {
  id: string;
  isDraft?: boolean;
  opportunityId: { id: string, name: string };
  planTitle: string;
  status?: number;
  services: ServiceItem[];
  companyInformationSection: CompanyInformationSection;
  localAgentDetailSection?: LocalAgentDetailSection;
  saudiCompanyDetails?: SaudiCompanyDetail[];
  partnershipModels?: PartnershipModel[];
  entityHeadcounts?: EntityHeadcount[];
  serviceHeadcounts?: ServiceHeadcount[];
  attachments?: AttachmentFile[];
  localizationStrategies?: LocalizationStrategy[];
}

type NumberOrEmpty = number | '';

export interface ServiceItem {
  id: string;
  serviceName: string;
  serviceDescription: string;
  serviceType: NumberOrEmpty;
  serviceCategory: NumberOrEmpty;
  serviceProvidedTo: NumberOrEmpty;
  targetedForLocalization: boolean;
  serviceLocalizationMethodology: number[];
  expectedLocalizationDate?: string;
  otherProvidedTo?: string;
  totalBusinessLast5Years: string;
}

export interface CompanyInformationSection {
  companyName: string;
  ceoName: string;
  ceoEmail: string;
  globalHQLocation: string;
  secVendorId: string;
  benaVendorId: string;
  hasLocalAgent: boolean;
  localAgentDetails?: string;
}

export interface LocalAgentDetailSection {
  localAgentName: string;
  agentContactPerson: string;
  agentEmail: string;
  agentContactNumber: string;
  agentCompanyLocation: string;
}

export interface SaudiCompanyDetail {
  id?: string;
  companyName: string;
  vendorIdWithSEC: string;
  benaRegisterVendorId: string;
  companyType: number[];
  qualificationStatus: NumberOrEmpty;
  companyOverview: string;
  keyProjectsForSEC: string;
  products?: string;
}

export interface PartnershipModel {
  id?: string;
  agreementType: NumberOrEmpty;
  otherAgreementType?: string;
  agreementSigningDate: string;
  agreementCopyProvided: boolean;
  keyAgreementClauses: string;
  selectionJustification: string;
  supervisionEntity: string;
}

export interface EntityHeadcount {
  id?: string;
  pageNumber: number; // 3 for existing saudi, 4 for direct localization
  y1Headcount: NumberOrEmpty;
  y1Saudization: NumberOrEmpty;
  y2Headcount: NumberOrEmpty;
  y2Saudization: NumberOrEmpty;
  y3Headcount: NumberOrEmpty;
  y3Saudization: NumberOrEmpty;
  y4Headcount: NumberOrEmpty;
  y4Saudization: NumberOrEmpty;
  y5Headcount: NumberOrEmpty;
  y5Saudization: NumberOrEmpty;
}

export interface ServiceHeadcount {
  id?: string;
  planServiceTypeId: string; // Service GUID
  measuresUpSkillSaudis: string;
  mentionSupportRequiredSEC: string;
  pageNumber: number; // 3 for existing saudi, 4 for direct localization
  y1Headcount: NumberOrEmpty;
  y1Saudization: NumberOrEmpty;
  y2Headcount: NumberOrEmpty;
  y2Saudization: NumberOrEmpty;
  y3Headcount: NumberOrEmpty;
  y3Saudization: NumberOrEmpty;
  y4Headcount: NumberOrEmpty;
  y4Saudization: NumberOrEmpty;
  y5Headcount: NumberOrEmpty;
  y5Saudization: NumberOrEmpty;
}

export interface AttachmentFile {
  id?: string;
  fileName: string;
  fileExtension?: string;
  fileUrl?: string;
  file: File;
}

export interface LocalizationStrategy {
  id?: string;
  planServiceTypeId: string; // Service GUID
  localizationApproach: NumberOrEmpty;
  locationType: NumberOrEmpty;
  expectedLocalizationDate: string;
  capexRequired: NumberOrEmpty;
  hasProprietaryTools: boolean;
  proprietaryToolsDetails?: string;
  governmentSupervision?: string;
  otherLocalizationApproach?: string;
  otherLocationType?: string;
}

/**
 * Helper to get form control value
 */
function getControlValue(formGroup: FormGroup, controlName: string, nestedValue: boolean = true): any {
  const control = formGroup.get(controlName);
  if (!control) return null;

  if (nestedValue && control instanceof FormGroup) {
    const valueControl = control.get(EMaterialsFormControls.value);
    return valueControl?.value ?? null;
  }

  return control.value ?? null;
}

/**
 * Convert string/number to a number; return empty string when missing/invalid.
 * (Avoids sending 0 defaults for invalid values.)
 */
function toNumberOrEmpty(value: any): NumberOrEmpty {
  if (value === null || value === undefined || value === '') return '';

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : '';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? parsed : '';
  }

  return '';
}

/**
 * Convert string/array to number array (for enum arrays)
 */
function toNumberArray(value: any): number[] {
  if (Array.isArray(value)) {
    return value
      .map(v => toNumberOrEmpty(v))
      .filter((v): v is number => typeof v === 'number');
  }
  if (value) {
    const single = toNumberOrEmpty(value);
    return typeof single === 'number' ? [single] : [];
  }
  return [];
}

/**
 * Map Services and Company Information
 */
function mapServicesAndCompanyInfo(formService: ServicePlanFormService): {
  services: ServiceItem[];
  companyInformationSection: CompanyInformationSection;
  localAgentDetailSection?: LocalAgentDetailSection;
} {
  const companyInfoGroup = formService.overviewCompanyInformationFormGroup;
  const locationInfoGroup = formService.locationInformationFormGroup;
  const localAgentInfoGroup = formService.localAgentInformationFormGroup;
  const serviceDetailsArray = formService.getServiceDetailsFormArray();

  const hasLocalAgent = locationInfoGroup?.get(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA)?.value || false;

  const companyInformationSection: CompanyInformationSection = {
    companyName: getControlValue(companyInfoGroup, EMaterialsFormControls.companyName) || '',
    ceoName: getControlValue(companyInfoGroup, EMaterialsFormControls.ceoName) || '',
    ceoEmail: getControlValue(companyInfoGroup, EMaterialsFormControls.ceoEmailID) || '',
    globalHQLocation: getControlValue(locationInfoGroup, EMaterialsFormControls.globalHQLocation) || '',
    secVendorId: getControlValue(locationInfoGroup, EMaterialsFormControls.registeredVendorIDwithSEC) || '',
    benaVendorId: getControlValue(locationInfoGroup, EMaterialsFormControls.benaRegisteredVendorID) || '',
    hasLocalAgent,
    localAgentDetails: hasLocalAgent ? (localAgentInfoGroup?.get(EMaterialsFormControls.localAgentDetails)?.value || undefined) : undefined,
  };

  let localAgentDetailSection: LocalAgentDetailSection | undefined;
  if (hasLocalAgent) {
    localAgentDetailSection = {
      localAgentName: getControlValue(localAgentInfoGroup, EMaterialsFormControls.localAgentName) || '',
      agentContactPerson: getControlValue(localAgentInfoGroup, EMaterialsFormControls.contactPersonName) || '',
      agentEmail: getControlValue(localAgentInfoGroup, EMaterialsFormControls.emailID) || '',
      agentContactNumber: getControlValue(localAgentInfoGroup, EMaterialsFormControls.contactNumber) || '',
      agentCompanyLocation: getControlValue(localAgentInfoGroup, EMaterialsFormControls.companyLocation) || '',
    };
  }

  const services: ServiceItem[] = [];
  if (serviceDetailsArray) {
    for (let i = 0; i < serviceDetailsArray.length; i++) {
      const detailGroup = serviceDetailsArray.at(i) as FormGroup;
      const serviceId = detailGroup.get(EMaterialsFormControls.serviceId)?.value || '';
      const methodology = getControlValue(detailGroup, EMaterialsFormControls.serviceLocalizationMethodology);

      services.push({
        id: serviceId,
        serviceName: getControlValue(detailGroup, EMaterialsFormControls.serviceName) || '',
        serviceDescription: getControlValue(detailGroup, EMaterialsFormControls.serviceDescription) || '',
        serviceType: toNumberOrEmpty(getControlValue(detailGroup, EMaterialsFormControls.serviceType)),
        serviceCategory: toNumberOrEmpty(getControlValue(detailGroup, EMaterialsFormControls.serviceCategory)),
        serviceProvidedTo: toNumberOrEmpty(getControlValue(detailGroup, EMaterialsFormControls.serviceProvidedTo)),
        targetedForLocalization: getControlValue(detailGroup, EMaterialsFormControls.serviceTargetedForLocalization) || false,
        serviceLocalizationMethodology: toNumberArray(methodology),
        expectedLocalizationDate: getControlValue(detailGroup, EMaterialsFormControls.expectedLocalizationDate) || undefined,
        otherProvidedTo: getControlValue(detailGroup, EMaterialsFormControls.serviceProvidedToCompanyNames) || undefined,
        totalBusinessLast5Years: getControlValue(detailGroup, EMaterialsFormControls.totalBusinessDoneLast5Years) || '',
      });
    }
  }

  return {
    services,
    companyInformationSection,
    localAgentDetailSection,
  };
}

/**
 * Map Existing Saudi data
 */
function mapExistingSaudiData(formService: ServicePlanFormService): {
  saudiCompanyDetails?: SaudiCompanyDetail[];
  partnershipModels?: PartnershipModel[];
  entityHeadcounts?: EntityHeadcount[];
  serviceHeadcounts?: ServiceHeadcount[];
  attachments?: AttachmentFile[];
} {
  const saudiCompanyArray = formService.saudiCompanyDetailsFormGroup;
  const collaborationArray = formService.collaborationPartnershipFormGroup;
  const entityLevelArray = formService.entityLevelFormGroup;
  const serviceLevelArray = formService.serviceLevelFormGroup;
  const attachmentsGroup = formService.step3_existingSaudi.get(EMaterialsFormControls.attachmentsFormGroup) as FormGroup;

  const result: {
    saudiCompanyDetails?: SaudiCompanyDetail[];
    partnershipModels?: PartnershipModel[];
    entityHeadcounts?: EntityHeadcount[];
    serviceHeadcounts?: ServiceHeadcount[];
    attachments?: AttachmentFile[];
  } = {};

  // Map Saudi Company Details
  if (saudiCompanyArray && saudiCompanyArray.length > 0) {
    result.saudiCompanyDetails = [];
    for (let i = 0; i < saudiCompanyArray.length; i++) {
      const companyGroup = saudiCompanyArray.at(i) as FormGroup;
      result.saudiCompanyDetails.push({
        companyName: getControlValue(companyGroup, EMaterialsFormControls.saudiCompanyName) || '',
        vendorIdWithSEC: getControlValue(companyGroup, EMaterialsFormControls.registeredVendorIDwithSEC) || '',
        benaRegisterVendorId: getControlValue(companyGroup, EMaterialsFormControls.benaRegisteredVendorID) || '',
        companyType: toNumberArray(getControlValue(companyGroup, EMaterialsFormControls.companyType)),
        qualificationStatus: toNumberOrEmpty(getControlValue(companyGroup, EMaterialsFormControls.qualificationStatus)),
        companyOverview: getControlValue(companyGroup, EMaterialsFormControls.companyOverview) || '',
        keyProjectsForSEC: getControlValue(companyGroup, EMaterialsFormControls.keyProjectsExecutedByContractorForSEC) || '',
        products: getControlValue(companyGroup, EMaterialsFormControls.products) || undefined,
      });
    }
  }

  // Map Partnership Models
  if (collaborationArray && collaborationArray.length > 0) {
    result.partnershipModels = [];
    for (let i = 0; i < collaborationArray.length; i++) {
      const partnerGroup = collaborationArray.at(i) as FormGroup;
      result.partnershipModels.push({
        agreementType: toNumberOrEmpty(getControlValue(partnerGroup, EMaterialsFormControls.agreementType)),
        otherAgreementType: getControlValue(partnerGroup, EMaterialsFormControls.agreementOtherDetails) || undefined,
        agreementSigningDate: getControlValue(partnerGroup, EMaterialsFormControls.agreementSigningDate) || '',
        agreementCopyProvided: getControlValue(partnerGroup, EMaterialsFormControls.provideAgreementCopy) || false,
        keyAgreementClauses: getControlValue(partnerGroup, EMaterialsFormControls.summaryOfKeyAgreementClauses) || '',
        selectionJustification: getControlValue(partnerGroup, EMaterialsFormControls.whyChoseThisCompany) || '',
        supervisionEntity: getControlValue(partnerGroup, EMaterialsFormControls.supervisionOversightEntity) || '',
      });
    }
  }

  // Map Entity Headcounts (Page 3 - Existing Saudi)
  if (entityLevelArray && entityLevelArray.length > 0) {
    result.entityHeadcounts = [];
    const entityGroup = entityLevelArray.at(0) as FormGroup;

    result.entityHeadcounts.push({
      pageNumber: 3,
      y1Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.firstYear}_headcount`)),
      y1Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.firstYear}_saudization`)),
      y2Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.secondYear}_headcount`)),
      y2Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.secondYear}_saudization`)),
      y3Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.thirdYear}_headcount`)),
      y3Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.thirdYear}_saudization`)),
      y4Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fourthYear}_headcount`)),
      y4Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fourthYear}_saudization`)),
      y5Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fifthYear}_headcount`)),
      y5Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fifthYear}_saudization`)),
    });
  }

  // Map Service Headcounts (Page 3 - Existing Saudi)
  if (serviceLevelArray && serviceLevelArray.length > 0) {
    result.serviceHeadcounts = result.serviceHeadcounts || [];
    for (let i = 0; i < serviceLevelArray.length; i++) {
      const serviceGroup = serviceLevelArray.at(i) as FormGroup;
      const serviceId = serviceGroup.get(EMaterialsFormControls.serviceId)?.value || '';

      result.serviceHeadcounts.push({
        planServiceTypeId: serviceId,
        measuresUpSkillSaudis: getControlValue(serviceGroup, EMaterialsFormControls.keyMeasuresToUpskillSaudis) || '',
        mentionSupportRequiredSEC: getControlValue(serviceGroup, EMaterialsFormControls.mentionSupportRequiredFromSEC) || '',
        pageNumber: 3,
        y1Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.firstYear}_headcount`)),
        y1Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.firstYear}_saudization`)),
        y2Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.secondYear}_headcount`)),
        y2Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.secondYear}_saudization`)),
        y3Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.thirdYear}_headcount`)),
        y3Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.thirdYear}_saudization`)),
        y4Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fourthYear}_headcount`)),
        y4Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fourthYear}_saudization`)),
        y5Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fifthYear}_headcount`)),
        y5Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fifthYear}_saudization`)),
      });
    }
  }

  // Map Attachments (from existing saudi)
  if (attachmentsGroup) {
    const attachmentFiles = getControlValue(attachmentsGroup, EMaterialsFormControls.attachments, true);
    if (attachmentFiles && Array.isArray(attachmentFiles) && attachmentFiles.length > 0) {
      result.attachments = result.attachments || [];
      attachmentFiles.forEach((file: File) => {
        result.attachments!.push({
          fileName: file.name,
          fileExtension: file.name.split('.').pop() || '',
          file,
        });
      });
    }
  }

  return result;
}

/**
 * Map Direct Localization data
 */
function mapDirectLocalizationData(formService: ServicePlanFormService): {
  localizationStrategies?: LocalizationStrategy[];
  entityHeadcounts?: EntityHeadcount[];
  serviceHeadcounts?: ServiceHeadcount[];
  attachments?: AttachmentFile[];
} {
  const localizationArray = formService.directLocalizationServiceLevelFormGroup;
  const entityLevelArray = formService.directLocalizationEntityLevelFormGroup;
  const serviceLevelArray = formService.directLocalizationServiceLevelFormGroup;
  const attachmentsGroup = formService.attachmentsFormGroup;

  const result: {
    localizationStrategies?: LocalizationStrategy[];
    entityHeadcounts?: EntityHeadcount[];
    serviceHeadcounts?: ServiceHeadcount[];
    attachments?: AttachmentFile[];
  } = {};

  // Map Localization Strategies
  if (localizationArray && localizationArray.length > 0) {
    result.localizationStrategies = [];
    for (let i = 0; i < localizationArray.length; i++) {
      const strategyGroup = localizationArray.at(i) as FormGroup;
      const serviceId = strategyGroup.get(EMaterialsFormControls.serviceId)?.value || '';

      result.localizationStrategies.push({
        planServiceTypeId: serviceId,
        localizationApproach: toNumberOrEmpty(getControlValue(strategyGroup, EMaterialsFormControls.localizationApproach)),
        locationType: toNumberOrEmpty(getControlValue(strategyGroup, EMaterialsFormControls.location)),
        expectedLocalizationDate: getControlValue(strategyGroup, EMaterialsFormControls.expectedLocalizationDate) || '',
        capexRequired: toNumberOrEmpty(getControlValue(strategyGroup, EMaterialsFormControls.capexRequired)),
        hasProprietaryTools: getControlValue(strategyGroup, EMaterialsFormControls.willBeAnyProprietaryToolsSystems) || false,
        proprietaryToolsDetails: getControlValue(strategyGroup, EMaterialsFormControls.proprietaryToolsSystemsDetails) || undefined,
        governmentSupervision: getControlValue(strategyGroup, EMaterialsFormControls.supervisionOversightEntity) || undefined,
        otherLocalizationApproach: getControlValue(strategyGroup, EMaterialsFormControls.localizationApproachOtherDetails) || undefined,
        otherLocationType: getControlValue(strategyGroup, EMaterialsFormControls.locationOtherDetails) || undefined,
      });
    }
  }

  // Map Entity Headcounts (Page 4 - Direct Localization)
  if (entityLevelArray && entityLevelArray.length > 0) {
    result.entityHeadcounts = [];
    const entityGroup = entityLevelArray.at(0) as FormGroup;
    result.entityHeadcounts.push({
      pageNumber: 4,
      y1Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.firstYear}_headcount`)),
      y1Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.firstYear}_saudization`)),
      y2Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.secondYear}_headcount`)),
      y2Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.secondYear}_saudization`)),
      y3Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.thirdYear}_headcount`)),
      y3Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.thirdYear}_saudization`)),
      y4Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fourthYear}_headcount`)),
      y4Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fourthYear}_saudization`)),
      y5Headcount: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fifthYear}_headcount`)),
      y5Saudization: toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fifthYear}_saudization`)),
    });
  }

  // Map Service Headcounts (Page 4 - Direct Localization)
  if (serviceLevelArray && serviceLevelArray.length > 0) {
    result.serviceHeadcounts = result.serviceHeadcounts || [];
    for (let i = 0; i < serviceLevelArray.length; i++) {
      const serviceGroup = serviceLevelArray.at(i) as FormGroup;
      const serviceId = serviceGroup.get(EMaterialsFormControls.serviceId)?.value || '';

      result.serviceHeadcounts.push({
        planServiceTypeId: serviceId,
        measuresUpSkillSaudis: getControlValue(serviceGroup, EMaterialsFormControls.keyMeasuresToUpskillSaudis) || '',
        mentionSupportRequiredSEC: getControlValue(serviceGroup, EMaterialsFormControls.mentionSupportRequiredFromSEC) || '',
        pageNumber: 4,
        y1Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.firstYear}_headcount`)),
        y1Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.firstYear}_saudization`)),
        y2Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.secondYear}_headcount`)),
        y2Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.secondYear}_saudization`)),
        y3Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.thirdYear}_headcount`)),
        y3Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.thirdYear}_saudization`)),
        y4Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fourthYear}_headcount`)),
        y4Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fourthYear}_saudization`)),
        y5Headcount: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fifthYear}_headcount`)),
        y5Saudization: toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fifthYear}_saudization`)),
      });
    }
  }

  // Map Attachments (from direct localization)
  if (attachmentsGroup) {
    const attachmentFiles = getControlValue(attachmentsGroup, EMaterialsFormControls.attachments, true);
    if (attachmentFiles && Array.isArray(attachmentFiles) && attachmentFiles.length > 0) {
      result.attachments = result.attachments || [];
      attachmentFiles.forEach((file: File) => {
        result.attachments!.push({
          fileName: file.name,
          fileExtension: file.name.split('.').pop() || '',
          file,
        });
      });
    }
  }

  return result;
}

/**
 * Create placeholder signature for draft/initial submission
 */
function createPlaceholderSignature(): Signature {
  return {
    id:'',
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
 * Main mapping function to convert form data to API request format
 */
export function mapServiceLocalizationPlanFormToRequest(
  formService: ServicePlanFormService,
  planId: string = '',
  signature?: Signature
): IServiceLocalizationPlanRequest {
  const basicInfoGroup = formService.basicInformationFormGroup;

  // Get opportunity ID and plan title
  const opportunityId = basicInfoGroup?.get(EMaterialsFormControls.opportunity)?.value || '';
  const planTitle = basicInfoGroup?.get(EMaterialsFormControls.planTitle)?.value || '';

  // Map services and company info
  const { services, companyInformationSection, localAgentDetailSection } = mapServicesAndCompanyInfo(formService);

  // Map existing saudi data
  const existingSaudiData = mapExistingSaudiData(formService);

  // Map direct localization data
  const directLocalizationData = mapDirectLocalizationData(formService);

  // Combine entity headcounts and service headcounts from available steps only
  const allEntityHeadcounts = [
    ...(existingSaudiData?.entityHeadcounts || []),
    ...(directLocalizationData?.entityHeadcounts || []),
  ];

  const allServiceHeadcounts = [
    ...(existingSaudiData?.serviceHeadcounts || []),
    ...(directLocalizationData?.serviceHeadcounts || []),
  ];

  const allAttachments = [
    ...(existingSaudiData?.attachments || []),
    ...(directLocalizationData?.attachments || []),
  ];

  const servicePlan: ServicePlan = {
    id: planId,
    opportunityId,
    planTitle,
    services,
    companyInformationSection,
    localAgentDetailSection,
    saudiCompanyDetails: existingSaudiData?.saudiCompanyDetails,
    partnershipModels: existingSaudiData?.partnershipModels,
    entityHeadcounts: allEntityHeadcounts.length > 0 ? allEntityHeadcounts : undefined,
    serviceHeadcounts: allServiceHeadcounts.length > 0 ? allServiceHeadcounts : undefined,
    attachments: allAttachments.length > 0 ? allAttachments : undefined,
    localizationStrategies: directLocalizationData?.localizationStrategies,
  };

  const signatureData = signature || createPlaceholderSignature();

  return {
    servicePlan,
    signature: signatureData,
  };
}

/**
 * Convert IServiceLocalizationPlanRequest to FormData
 */
export function convertServiceRequestToFormData(request: IServiceLocalizationPlanRequest): FormData {
  const formData = new FormData();
  const { servicePlan, signature } = request;


  // Add signature
  if (signature.id) formData.append('Signature.Id', signature.id);
  if (signature.signatureValue) formData.append('Signature.SignatureValue', signature.signatureValue);
  if (signature.contactInfo) {
    formData.append('Signature.ContactInfo.Name', signature.contactInfo.name || '');
    formData.append('Signature.ContactInfo.JobTitle', signature.contactInfo.jobTitle || '');
    formData.append('Signature.ContactInfo.ContactNumber', signature.contactInfo.contactNumber || '');
    formData.append('Signature.ContactInfo.EmailId', signature.contactInfo.emailId || '');
  }

  // Add service plan basic fields
  if (servicePlan.id) formData.append('ServicePlan.Id', servicePlan.id);
  if (servicePlan.isDraft !== undefined) formData.append('ServicePlan.IsDraft', servicePlan.isDraft.toString());
  formData.append('ServicePlan.OpportunityId', servicePlan.opportunityId.id);
  formData.append('ServicePlan.PlanTitle', servicePlan.planTitle);
  if (servicePlan.status !== undefined) formData.append('ServicePlan.Status', servicePlan.status.toString());

  // Add services array
  servicePlan.services.forEach((service, index) => {
    formData.append(`ServicePlan.Services[${index}].Id`, service.id);
    formData.append(`ServicePlan.Services[${index}].ServiceName`, service.serviceName);
    formData.append(`ServicePlan.Services[${index}].ServiceDescription`, service.serviceDescription);
    formData.append(`ServicePlan.Services[${index}].ServiceType`, service.serviceType.toString());
    formData.append(`ServicePlan.Services[${index}].ServiceCategory`, service.serviceCategory.toString());
    formData.append(`ServicePlan.Services[${index}].ServiceProvidedTo`, service.serviceProvidedTo.toString());
    formData.append(`ServicePlan.Services[${index}].TargetedForLocalization`, service.targetedForLocalization.toString());
    service.serviceLocalizationMethodology.forEach((method, methodIndex) => {
      formData.append(`ServicePlan.Services[${index}].ServiceLocalizationMethodology[${methodIndex}]`, method.toString());
    });
    if (service.expectedLocalizationDate) {
      formData.append(`ServicePlan.Services[${index}].ExpectedLocalizationDate`, service.expectedLocalizationDate);
    }
    if (service.otherProvidedTo) {
      formData.append(`ServicePlan.Services[${index}].OtherProvidedTo`, service.otherProvidedTo);
    }
    formData.append(`ServicePlan.Services[${index}].TotalBusinessLast5Years`, service.totalBusinessLast5Years);
  });

  // Add company information section
  const companyInfo = servicePlan.companyInformationSection;
  formData.append('ServicePlan.CompanyInformationSection.CompanyName', companyInfo.companyName);
  formData.append('ServicePlan.CompanyInformationSection.CEOName', companyInfo.ceoName);
  formData.append('ServicePlan.CompanyInformationSection.CEOEmail', companyInfo.ceoEmail);
  formData.append('ServicePlan.CompanyInformationSection.GlobalHQLocation', companyInfo.globalHQLocation);
  formData.append('ServicePlan.CompanyInformationSection.SECVendorId', companyInfo.secVendorId);
  formData.append('ServicePlan.CompanyInformationSection.BenaVendorId', companyInfo.benaVendorId);
  formData.append('ServicePlan.CompanyInformationSection.HasLocalAgent', companyInfo.hasLocalAgent.toString());
  if (companyInfo.localAgentDetails) {
    formData.append('ServicePlan.CompanyInformationSection.LocalAgentDetails', companyInfo.localAgentDetails);
  }

  // Add local agent detail section if present
  if (servicePlan.localAgentDetailSection) {
    const agent = servicePlan.localAgentDetailSection;
    formData.append('ServicePlan.LocalAgentDetailSection.LocalAgentName', agent.localAgentName);
    formData.append('ServicePlan.LocalAgentDetailSection.AgentContactPerson', agent.agentContactPerson);
    formData.append('ServicePlan.LocalAgentDetailSection.AgentEmail', agent.agentEmail);
    formData.append('ServicePlan.LocalAgentDetailSection.AgentContactNumber', agent.agentContactNumber);
    formData.append('ServicePlan.LocalAgentDetailSection.AgentCompanyLocation', agent.agentCompanyLocation);
  }

  // Add saudi company details if present
  if (servicePlan.saudiCompanyDetails) {
    servicePlan.saudiCompanyDetails.forEach((company, index) => {
      if (company.id) formData.append(`ServicePlan.SaudiCompanyDetails[${index}].Id`, company.id);
      formData.append(`ServicePlan.SaudiCompanyDetails[${index}].CompanyName`, company.companyName);
      formData.append(`ServicePlan.SaudiCompanyDetails[${index}].VendorIdWithSEC`, company.vendorIdWithSEC);
      formData.append(`ServicePlan.SaudiCompanyDetails[${index}].BenaRegisterVendorId`, company.benaRegisterVendorId);
      company.companyType.forEach((type, typeIndex) => {
        formData.append(`ServicePlan.SaudiCompanyDetails[${index}].CompanyType[${typeIndex}]`, type.toString());
      });
      formData.append(`ServicePlan.SaudiCompanyDetails[${index}].QualificationStatus`, company.qualificationStatus.toString());
      formData.append(`ServicePlan.SaudiCompanyDetails[${index}].CompanyOverview`, company.companyOverview);
      formData.append(`ServicePlan.SaudiCompanyDetails[${index}].KeyProjectsForSEC`, company.keyProjectsForSEC);
      if (company.products) {
        formData.append(`ServicePlan.SaudiCompanyDetails[${index}].Products`, company.products);
      }
    });
  }

  // Add partnership models if present
  if (servicePlan.partnershipModels) {
    servicePlan.partnershipModels.forEach((partnership, index) => {
      if (partnership.id) formData.append(`ServicePlan.PartnershipModels[${index}].Id`, partnership.id);
      formData.append(`ServicePlan.PartnershipModels[${index}].AgreementType`, partnership.agreementType.toString());
      if (partnership.otherAgreementType) {
        formData.append(`ServicePlan.PartnershipModels[${index}].OtherAgreementType`, partnership.otherAgreementType);
      }
      formData.append(`ServicePlan.PartnershipModels[${index}].AgreementSigningDate`, partnership.agreementSigningDate);
      formData.append(`ServicePlan.PartnershipModels[${index}].AgreementCopyProvided`, partnership.agreementCopyProvided.toString());
      formData.append(`ServicePlan.PartnershipModels[${index}].KeyAgreementClauses`, partnership.keyAgreementClauses);
      formData.append(`ServicePlan.PartnershipModels[${index}].SelectionJustification`, partnership.selectionJustification);
      formData.append(`ServicePlan.PartnershipModels[${index}].SupervisionEntity`, partnership.supervisionEntity);
    });
  }

  // Add entity headcounts if present
  if (servicePlan.entityHeadcounts) {
    servicePlan.entityHeadcounts.forEach((entity, index) => {
      if (entity.id) formData.append(`ServicePlan.EntityHeadcounts[${index}].Id`, entity.id);
      formData.append(`ServicePlan.EntityHeadcounts[${index}].PageNumber`, entity.pageNumber.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y1Headcount`, entity.y1Headcount.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y1Saudization`, entity.y1Saudization.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y2Headcount`, entity.y2Headcount.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y2Saudization`, entity.y2Saudization.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y3Headcount`, entity.y3Headcount.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y3Saudization`, entity.y3Saudization.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y4Headcount`, entity.y4Headcount.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y4Saudization`, entity.y4Saudization.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y5Headcount`, entity.y5Headcount.toString());
      formData.append(`ServicePlan.EntityHeadcounts[${index}].Y5Saudization`, entity.y5Saudization.toString());
    });
  }

  // Add service headcounts if present
  if (servicePlan.serviceHeadcounts) {
    servicePlan.serviceHeadcounts.forEach((service, index) => {
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].PlanServiceTypeId`, service.planServiceTypeId);
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].MeasuresUpSkillSaudis`, service.measuresUpSkillSaudis);
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].MentionSupportRequiredSEC`, service.mentionSupportRequiredSEC);
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].PageNumber`, service.pageNumber.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y1Headcount`, service.y1Headcount.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y1Saudization`, service.y1Saudization.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y2Headcount`, service.y2Headcount.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y2Saudization`, service.y2Saudization.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y3Headcount`, service.y3Headcount.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y3Saudization`, service.y3Saudization.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y4Headcount`, service.y4Headcount.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y4Saudization`, service.y4Saudization.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y5Headcount`, service.y5Headcount.toString());
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].Y5Saudization`, service.y5Saudization.toString());
    });
  }

  // Add attachments if present
  if (servicePlan.attachments) {
    servicePlan.attachments.forEach((attachment, index) => {
      if (attachment.id) formData.append(`ServicePlan.Attachments[${index}].Id`, attachment.id);
      formData.append(`ServicePlan.Attachments[${index}]`, attachment.file, attachment.fileName);
    });
  }

  // Add localization strategies if condition met and present
  if (servicePlan.localizationStrategies) {
    servicePlan.localizationStrategies.forEach((strategy, index) => {
      if (strategy.id) formData.append(`ServicePlan.LocalizationStrategies[${index}].Id`, strategy.id);
      formData.append(`ServicePlan.LocalizationStrategies[${index}].PlanServiceTypeId`, strategy.planServiceTypeId);
      formData.append(`ServicePlan.LocalizationStrategies[${index}].LocalizationApproach`, strategy.localizationApproach.toString());
      formData.append(`ServicePlan.LocalizationStrategies[${index}].LocalizationType`, strategy.locationType.toString());
      formData.append(`ServicePlan.LocalizationStrategies[${index}].ExpectedLocalizationDate`, strategy.expectedLocalizationDate);
      formData.append(`ServicePlan.LocalizationStrategies[${index}].CapexRequired`, strategy.capexRequired.toString());
      formData.append(`ServicePlan.LocalizationStrategies[${index}].HasProprietaryTools`, strategy.hasProprietaryTools.toString());
      if (strategy.proprietaryToolsDetails) {
        formData.append(`ServicePlan.LocalizationStrategies[${index}].ProprietaryToolsDetails`, strategy.proprietaryToolsDetails);
      }
      if (strategy.governmentSupervision) {
        formData.append(`ServicePlan.LocalizationStrategies[${index}].GovernmentSupervision`, strategy.governmentSupervision);
      }
      if (strategy.otherLocalizationApproach) {
        formData.append(`ServicePlan.LocalizationStrategies[${index}].OtherLocalizationApproach`, strategy.otherLocalizationApproach);
      }
      if (strategy.otherLocationType) {
        formData.append(`ServicePlan.LocalizationStrategies[${index}].OtherLocationType`, strategy.otherLocationType);
      }
    });
  }

  return formData;
}
