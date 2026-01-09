import { FormArray, FormGroup } from '@angular/forms';
import { ServicePlanFormService } from '../services/plan/service-plan-form-service/service-plan-form-service';
import { EMaterialsFormControls } from '../enums/product-localization-form-controls.enum';
import { Signature } from '../interfaces/plans.interface';
import { ELocalizationMethodology, EYesNo } from 'src/app/shared/enums';
import type {
  Attachment,
  IServiceLocalizationPlanResponse,
  IServicePlanEntityHeadcount,
  IServicePlanLocalizationStrategy,
  IServicePlanResponse,
  IServicePlanServiceHeadcount,
  IServicePlanServiceItem,
} from 'src/app/shared/interfaces/plans.interface';
import { API_ENDPOINTS } from 'src/app/shared/api/api-endpoints';
import { parsePhoneNumber } from 'src/app/shared/data/countries.data';

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
  targetedForLocalization?: boolean;
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
  hasLocalAgent?: boolean;
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
  companyOverviewOther: string;
  companyOverviewKeyProjectDetails?: string;
  keyProjectsForSEC: string;
  products?: string;
}

export interface PartnershipModel {
  id?: string;
  agreementType: NumberOrEmpty;
  otherAgreementType?: string;
  agreementSigningDate: string;
  agreementCopyProvided?: boolean;
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
  localizationDate?: string; // For service level table in steps 3 and 4
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
  hasProprietaryTools?: boolean;
  proprietaryToolsDetails?: string;
  governmentSupervision?: string;
  otherLocalizationApproach?: string;
  otherLocationType?: string;
}

/**
 * Helper to get form control value
 */
function getControlValue(formGroup: FormGroup, controlName: string, nestedValue: boolean = true) {
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

function toBooleanYesNo(value: any): boolean {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;

  if (value === EYesNo.Yes || value === EYesNo.Yes.toString()) return true;
  if (value === EYesNo.No || value === EYesNo.No.toString()) return false;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'yes') return true;
    if (normalized === 'no') return false;
    if (normalized === '1') return true;
    if (normalized === '2') return false;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 2) return false;
    if (value === 0) return false;
  }

  return false;
}

function toBooleanYesNoOrUndefined(value: any): boolean | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  return toBooleanYesNo(value);
}

function toYesNoId(value: boolean | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value ? EYesNo.Yes.toString() : EYesNo.No.toString();
}

function setNestedValue(formGroup: FormGroup | null, controlName: string, value: any): void {
  if (!formGroup) return;
  const control = formGroup.get(controlName);
  if (!control) return;

  if (control instanceof FormGroup) {
    const valueControl = control.get(EMaterialsFormControls.value);
    valueControl?.setValue(value ?? null, { emitEvent: false });
  }
}

function setPhoneValue(formGroup: FormGroup | null, controlName: string, phoneString: string | null | undefined): void {
  if (!formGroup) return;

  const control = formGroup.get(controlName);
  if (!(control instanceof FormGroup)) return;

  const valueControl = control.get(EMaterialsFormControls.value);
  if (!valueControl) return;

  if (!phoneString) {
    valueControl.setValue(null, { emitEvent: false });
    return;
  }

  valueControl.setValue(parsePhoneNumber(phoneString), { emitEvent: false });
}

function setDirectValue(formGroup: FormGroup | null, controlName: string, value: any): void {
  if (!formGroup) return;
  const control = formGroup.get(controlName);
  control?.setValue(value ?? null, { emitEvent: false });
}

function clearAndRebuildFormArray(
  formArray: FormArray | null,
  count: number,
  createItem: () => FormGroup
): void {
  if (!formArray) return;
  while (formArray.length > 0) formArray.removeAt(0);

  const safeCount = count > 0 ? count : 1;
  for (let i = 0; i < safeCount; i++) {
    formArray.push(createItem());
  }
}

function getMimeTypeFromExtension(ext?: string | null): string {
  const e = (ext ?? '').replace('.', '').toLowerCase();
  if (e === 'pdf') return 'application/pdf';
  if (e === 'png') return 'image/png';
  if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
  if (e === 'zip') return 'application/zip';
  if (e === 'rar') return 'application/vnd.rar';
  return 'application/octet-stream';
}

function toExistingFile(att: Attachment): File {
  const fileExtension = att.fileExtension || '';
  const fileName = att.fileName + (fileExtension ? fileExtension : '');
  const fileType = getMimeTypeFromExtension(fileExtension);
  const blob = new Blob([], { type: fileType });
  const file = new File([blob], fileName, { type: fileType });

  let fullFileUrl = att.fileUrl || '';
  if (fullFileUrl && !fullFileUrl.startsWith('http://') && !fullFileUrl.startsWith('https://')) {
    const baseUrl = API_ENDPOINTS.baseUrl.replace('/api', '');
    fullFileUrl = baseUrl + (fullFileUrl.startsWith('/') ? fullFileUrl : '/' + fullFileUrl);
  }

  (file as any).id = att.id;
  (file as any).fileUrl = fullFileUrl;
  (file as any).fileExtension = fileExtension;
  (file as any).isExistingAttachment = true;

  return file;
}

function findByPage<T extends { pageNumber: number }>(items: T[] | undefined, pageNumber: number): T | undefined {
  return (items ?? []).find((x) => x.pageNumber === pageNumber);
}

function findByServiceId<T extends { planServiceTypeId: string; pageNumber?: number }>(
  items: T[] | undefined,
  planServiceTypeId: string,
  pageNumber?: number
): T | undefined {
  const list = items ?? [];
  return list.find((x) => x.planServiceTypeId === planServiceTypeId && (pageNumber == null || x.pageNumber === pageNumber));
}

function setYearValues(
  group: FormGroup,
  data: {
    y1Headcount?: number;
    y1Saudization?: number;
    y2Headcount?: number;
    y2Saudization?: number;
    y3Headcount?: number;
    y3Saudization?: number;
    y4Headcount?: number;
    y4Saudization?: number;
    y5Headcount?: number;
    y5Saudization?: number;
  }
): void {
  setNestedValue(group, `${EMaterialsFormControls.firstYear}_headcount`, data.y1Headcount ?? null);
  setNestedValue(group, `${EMaterialsFormControls.firstYear}_saudization`, data.y1Saudization ?? null);
  setNestedValue(group, `${EMaterialsFormControls.secondYear}_headcount`, data.y2Headcount ?? null);
  setNestedValue(group, `${EMaterialsFormControls.secondYear}_saudization`, data.y2Saudization ?? null);
  setNestedValue(group, `${EMaterialsFormControls.thirdYear}_headcount`, data.y3Headcount ?? null);
  setNestedValue(group, `${EMaterialsFormControls.thirdYear}_saudization`, data.y3Saudization ?? null);
  setNestedValue(group, `${EMaterialsFormControls.fourthYear}_headcount`, data.y4Headcount ?? null);
  setNestedValue(group, `${EMaterialsFormControls.fourthYear}_saudization`, data.y4Saudization ?? null);
  setNestedValue(group, `${EMaterialsFormControls.fifthYear}_headcount`, data.y5Headcount ?? null);
  setNestedValue(group, `${EMaterialsFormControls.fifthYear}_saudization`, data.y5Saudization ?? null);
}

/**
 * Map GET service-plan response to form structure (edit/view mode)
 */
export function mapServicePlanResponseToForm(
  response: IServiceLocalizationPlanResponse,
  formService: ServicePlanFormService,
  options?: { opportunityItem?: { id: string; name: string } | null }
): void {
  const servicePlan: IServicePlanResponse = response.servicePlan;

  // Step 1: Cover Page
  const step1Company = formService.coverPageCompanyInformationFormGroup;
  setNestedValue(step1Company, EMaterialsFormControls.planTitle, servicePlan.planTitle ?? '');
  setNestedValue(step1Company, EMaterialsFormControls.companyName, servicePlan.companyInformationSection?.companyName ?? '');

  const servicesArray = formService.getServicesFormArray();
  clearAndRebuildFormArray(servicesArray, servicePlan.services?.length ?? 1, () => formService.createServiceItem());
  (servicePlan.services ?? []).forEach((svc: IServicePlanServiceItem, idx: number) => {
    const row = servicesArray?.at(idx) as FormGroup | undefined;
    if (!row) return;
    // Only set serviceId from backend if provided; otherwise preserve the auto-generated UUID
    if (svc.id) {
      row.get(EMaterialsFormControls.serviceId)?.setValue(svc.id, { emitEvent: false });
    }
    setNestedValue(row, EMaterialsFormControls.serviceName, svc.serviceName ?? '');
    // Store row id (for potential future edit mapping)
    row.get(EMaterialsFormControls.rowId)?.setValue(svc.id ?? null, { emitEvent: false });
  });

  // Force sync dependent arrays so we can safely patch them next
  formService.syncServicesFromCoverPageToOverview();
  formService.syncServicesFromCoverPageToExistingSaudi();
  formService.syncServicesFromCoverPageToDirectLocalization();

  // Step 2: Overview
  const basicInfo = formService.basicInformationFormGroup;
  if (basicInfo) {
    const opportunity = options?.opportunityItem ?? null;
    if (opportunity) {
      basicInfo.get(EMaterialsFormControls.opportunity)?.setValue(opportunity, { emitEvent: false });
    }
  }

  const companyInfo = formService.overviewCompanyInformationFormGroup;
  const companySection = servicePlan.companyInformationSection;
  setNestedValue(companyInfo, EMaterialsFormControls.companyName, companySection?.companyName ?? '');
  setNestedValue(companyInfo, EMaterialsFormControls.ceoName, companySection?.ceoName ?? '');
  setNestedValue(companyInfo, EMaterialsFormControls.ceoEmailID, companySection?.ceoEmail ?? '');

  const locationInfo = formService.locationInformationFormGroup;
  setNestedValue(locationInfo, EMaterialsFormControls.globalHQLocation, companySection?.globalHQLocation ?? '');
  setNestedValue(locationInfo, EMaterialsFormControls.registeredVendorIDwithSEC, companySection?.secVendorId ?? '');
  setNestedValue(locationInfo, EMaterialsFormControls.benaRegisteredVendorID, companySection?.benaVendorId ?? '');
  setDirectValue(locationInfo, EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA, companySection?.hasLocalAgent ?? false);
  formService.toggleLocalAgentInformValidation(companySection?.hasLocalAgent === true);

  const localAgentInfo = formService.localAgentInformationFormGroup;
  setDirectValue(localAgentInfo, EMaterialsFormControls.localAgentDetails, companySection?.localAgentDetails ?? '');

  const agent = servicePlan.localAgentDetailSection;
  setNestedValue(localAgentInfo, EMaterialsFormControls.localAgentName, agent?.localAgentName ?? '');
  setNestedValue(localAgentInfo, EMaterialsFormControls.contactPersonName, agent?.agentContactPerson ?? '');
  setNestedValue(localAgentInfo, EMaterialsFormControls.emailID, agent?.agentEmail ?? '');
  setPhoneValue(localAgentInfo, EMaterialsFormControls.contactNumber, agent?.agentContactNumber);
  setNestedValue(localAgentInfo, EMaterialsFormControls.companyLocation, agent?.agentCompanyLocation ?? '');

  const detailsArray = formService.getServiceDetailsFormArray();
  (detailsArray?.controls ?? []).forEach((ctrl, idx) => {
    const row = ctrl as FormGroup;
    const serviceId = row.get(EMaterialsFormControls.serviceId)?.value;
    const svc = (servicePlan.services ?? []).find((s) => s.id === serviceId) ?? (servicePlan.services ?? [])[idx];
    if (!svc) return;

    row.get(EMaterialsFormControls.rowId)?.setValue(svc.id ?? null, { emitEvent: false });
    setNestedValue(row, EMaterialsFormControls.serviceName, svc.serviceName ?? '');
    setNestedValue(row, EMaterialsFormControls.serviceType, svc.serviceType != null ? String(svc.serviceType) : null);
    setNestedValue(row, EMaterialsFormControls.serviceCategory, svc.serviceCategory != null ? String(svc.serviceCategory) : null);
    setNestedValue(row, EMaterialsFormControls.serviceDescription, svc.serviceDescription ?? '');
    setNestedValue(row, EMaterialsFormControls.serviceProvidedTo, svc.serviceProvidedTo != null ? String(svc.serviceProvidedTo) : null);
    setNestedValue(row, EMaterialsFormControls.totalBusinessDoneLast5Years, svc.totalBusinessLast5Years ?? '');
    setNestedValue(row, EMaterialsFormControls.serviceTargetedForLocalization, toYesNoId(!!svc.targetedForLocalization));
    setNestedValue(
      row,
      EMaterialsFormControls.serviceLocalizationMethodology,
      (svc.serviceLocalizationMethodology ?? []).map((x) => String(x))?.[0]
    );

    // Keep conditional validators in sync - call toggles first, then set conditional values
    // This ensures values are not reset by the toggle functions
    const providedToId = svc.serviceProvidedTo != null ? String(svc.serviceProvidedTo) : null;
    formService.toggleServiceProvidedToCompanyNamesValidation(providedToId, idx);
    formService.toggleExpectedLocalizationDateValidation(toYesNoId(!!svc.targetedForLocalization), idx);

    // Set values that may be reset by toggle functions AFTER the toggles
    setNestedValue(row, EMaterialsFormControls.serviceProvidedToCompanyNames, svc.otherProvidedTo ?? '');
    setNestedValue(row, EMaterialsFormControls.expectedLocalizationDate, svc.expectedLocalizationDate ?? '');
  });

  // Re-sync filtered service tables based on the (now) mapped methodology.
  // (Mapping uses emitEvent:false, so ServicePlanFormService subscriptions won't fire here.)
  formService.syncServicesFromCoverPageToExistingSaudi();
  formService.syncServicesFromCoverPageToDirectLocalization();

  // Step 3: Existing Saudi
  const saudiCompaniesArray = formService.saudiCompanyDetailsFormGroup;
  clearAndRebuildFormArray(saudiCompaniesArray, servicePlan.saudiCompanyDetails?.length ?? 1, () => formService.createSaudiCompanyDetailItem());
  (servicePlan.saudiCompanyDetails ?? []).forEach((co, idx) => {
    const row = saudiCompaniesArray?.at(idx) as FormGroup | undefined;
    if (!row) return;
    row.get(EMaterialsFormControls.rowId)?.setValue(co.id ?? null, { emitEvent: false });
    // Set values in the same order as form builder creates controls to preserve key order
    setNestedValue(row, EMaterialsFormControls.saudiCompanyName, co.companyName ?? '');
    setNestedValue(row, EMaterialsFormControls.registeredVendorIDwithSEC, co.vendorIdWithSEC ?? '');
    setNestedValue(row, EMaterialsFormControls.benaRegisteredVendorID, co.benaRegisterVendorId ?? '');
    setNestedValue(row, EMaterialsFormControls.companyType, (co.companyType ?? []).map((x) => String(x)));
    setNestedValue(row, EMaterialsFormControls.qualificationStatus, co.qualificationStatus != null ? String(co.qualificationStatus) : null);
    setNestedValue(row, EMaterialsFormControls.products, co.products ?? '');
    setNestedValue(row, EMaterialsFormControls.companyOverview, co.companyOverview ?? '');
    setNestedValue(row, EMaterialsFormControls.keyProjectsExecutedByContractorForSEC, co.keyProjectsForSEC ?? '');
    setNestedValue(row, EMaterialsFormControls.companyOverviewKeyProjectDetails, co.companyOverviewKeyProjectDetails ?? '');
    setNestedValue(row, EMaterialsFormControls.companyOverviewOther, co.companyOverviewOther ?? '');
  });

  const partnershipArray = formService.collaborationPartnershipFormGroup;
  clearAndRebuildFormArray(partnershipArray, servicePlan.partnershipModels?.length ?? 1, () => formService.createCollaborationPartnershipItem());
  (servicePlan.partnershipModels ?? []).forEach((pm, idx) => {
    const row = partnershipArray?.at(idx) as FormGroup | undefined;
    if (!row) return;
    row.get(EMaterialsFormControls.rowId)?.setValue(pm.id ?? null, { emitEvent: false });
    setNestedValue(row, EMaterialsFormControls.agreementType, pm.agreementType != null ? String(pm.agreementType) : null);
    setNestedValue(row, EMaterialsFormControls.agreementSigningDate, pm.agreementSigningDate ?? null);
    setNestedValue(row, EMaterialsFormControls.agreementOtherDetails, pm.otherAgreementType ?? '');
    setNestedValue(row, EMaterialsFormControls.supervisionOversightEntity, pm.supervisionEntity ?? '');
    setNestedValue(row, EMaterialsFormControls.whyChoseThisCompany, pm.selectionJustification ?? '');
    setNestedValue(row, EMaterialsFormControls.summaryOfKeyAgreementClauses, pm.keyAgreementClauses ?? '');
    setNestedValue(row, EMaterialsFormControls.provideAgreementCopy, toYesNoId(pm.agreementCopyProvided));
    formService.toggleAgreementOtherDetailsValidation(pm.agreementType != null ? String(pm.agreementType) : null, idx);
    formService.toggleAgreementCopyValidation(toYesNoId(pm.agreementCopyProvided), idx);
  });

  const entity3: IServicePlanEntityHeadcount | undefined = findByPage(servicePlan.entityHeadcounts, 3);
  const entityArray3 = formService.entityLevelFormGroup;
  if (entity3 && entityArray3 && entityArray3.length > 0) {
    const row = entityArray3.at(0) as FormGroup;
    row.get(EMaterialsFormControls.rowId)?.setValue(entity3.id ?? null, { emitEvent: false });
    setYearValues(row, entity3);
  }

  const serviceLevelArray3 = formService.serviceLevelFormGroup;
  (serviceLevelArray3?.controls ?? []).forEach((ctrl) => {
    const row = ctrl as FormGroup;
    const serviceId = row.get(EMaterialsFormControls.serviceId)?.value;
    if (!serviceId) return;

    const head: IServicePlanServiceHeadcount | undefined = findByServiceId(servicePlan.serviceHeadcounts, serviceId, 3);
    if (!head) return;
    row.get(EMaterialsFormControls.rowId)?.setValue((head as any).id ?? null, { emitEvent: false });
    // Read localizationDate from serviceHeadcounts (backend sends it as localizationDate)
    if (head.localizationDate) {
      setNestedValue(row, EMaterialsFormControls.expectedLocalizationDate, head.localizationDate);
    }
    setYearValues(row, head);
    setNestedValue(row, EMaterialsFormControls.keyMeasuresToUpskillSaudis, head.measuresUpSkillSaudis ?? '');
    setNestedValue(row, EMaterialsFormControls.mentionSupportRequiredFromSEC, head.mentionSupportRequiredSEC ?? '');
  });

  // Step 4: Direct Localization
  const entity4: IServicePlanEntityHeadcount | undefined = findByPage(servicePlan.entityHeadcounts, 4);
  const entityArray4 = formService.directLocalizationEntityLevelFormGroup;

  if (entity4 && entityArray4 && entityArray4.length > 0) {
    const row = entityArray4.at(0) as FormGroup;
    row.get(EMaterialsFormControls.rowId)?.setValue(entity4.id ?? null, { emitEvent: false });
    setYearValues(row, entity4);
  }

  const serviceLevelArray4 = formService.directLocalizationServiceLevelFormGroup;
  (serviceLevelArray4?.controls ?? []).forEach((ctrl) => {
    const row = ctrl as FormGroup;
    const serviceId = row.get(EMaterialsFormControls.serviceId)?.value;
    if (!serviceId) return;

    const strategy: IServicePlanLocalizationStrategy | undefined = findByServiceId(servicePlan.localizationStrategies, serviceId);
    const head: IServicePlanServiceHeadcount | undefined = findByServiceId(servicePlan.serviceHeadcounts, serviceId, 4);

    if (strategy) {
      row.get(EMaterialsFormControls.rowId)?.setValue(strategy.id ?? null, { emitEvent: false });
      setNestedValue(row, EMaterialsFormControls.expectedLocalizationDate, strategy.expectedLocalizationDate ?? '');
      setNestedValue(row, EMaterialsFormControls.localizationApproach, strategy.localizationApproach != null ? String(strategy.localizationApproach) : null);
      setNestedValue(row, EMaterialsFormControls.localizationApproachOtherDetails, strategy.otherLocalizationApproach ?? '');
      setNestedValue(row, EMaterialsFormControls.location, strategy.locationType != null ? String(strategy.locationType) : null);
      setNestedValue(row, EMaterialsFormControls.locationOtherDetails, strategy.otherLocationType ?? '');
      setNestedValue(row, EMaterialsFormControls.capexRequired, strategy.capexRequired ?? null);
      setNestedValue(row, EMaterialsFormControls.supervisionOversightEntity, strategy.governmentSupervision ?? '');
      setNestedValue(row, EMaterialsFormControls.willBeAnyProprietaryToolsSystems, toYesNoId(strategy.hasProprietaryTools));
      setNestedValue(row, EMaterialsFormControls.proprietaryToolsSystemsDetails, strategy.proprietaryToolsDetails ?? '');
    }

    if (head) {
      // Read localizationDate from serviceHeadcounts for service-level table
      // Service level table uses the separate serviceLevelLocalizationDate control
      if (head.localizationDate) {
        setNestedValue(row, EMaterialsFormControls.serviceLevelLocalizationDate, head.localizationDate);
      }
      setYearValues(row, head);
      setNestedValue(row, EMaterialsFormControls.keyMeasuresToUpskillSaudis, head.measuresUpSkillSaudis ?? '');
      setNestedValue(row, EMaterialsFormControls.mentionSupportRequiredFromSEC, head.mentionSupportRequiredSEC ?? '');
    }
  });

  // Attachments (shared control in step4)
  const attachmentsGroup = formService.attachmentsFormGroup;
  const attControl = attachmentsGroup?.get(EMaterialsFormControls.attachments);
  if (attachmentsGroup && attControl instanceof FormGroup) {
    const valueControl = attControl.get(EMaterialsFormControls.value);
    const attachments = servicePlan.attachments ?? [];
    const files = attachments.map(toExistingFile);
    valueControl?.setValue(files, { emitEvent: false });
  }
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

  // Get service IDs from cover page (source of truth) since sync may not have run yet
  const coverPageServicesArray = formService.getServicesFormArray();
  const coverPageServiceIds: string[] = [];
  if (coverPageServicesArray) {
    for (let i = 0; i < coverPageServicesArray.length; i++) {
      const serviceGroup = coverPageServicesArray.at(i) as FormGroup;
      coverPageServiceIds.push(serviceGroup.get(EMaterialsFormControls.serviceId)?.value || '');
    }
  }

  const hasLocalAgent = toBooleanYesNoOrUndefined(
    locationInfoGroup?.get(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA)?.value
  );

  const companyInformationSection: CompanyInformationSection = {
    companyName: getControlValue(companyInfoGroup, EMaterialsFormControls.companyName) || '',
    ceoName: getControlValue(companyInfoGroup, EMaterialsFormControls.ceoName) || '',
    ceoEmail: getControlValue(companyInfoGroup, EMaterialsFormControls.ceoEmailID) || '',
    globalHQLocation: getControlValue(locationInfoGroup, EMaterialsFormControls.globalHQLocation) || '',
    secVendorId: getControlValue(locationInfoGroup, EMaterialsFormControls.registeredVendorIDwithSEC) || '',
    benaVendorId: getControlValue(locationInfoGroup, EMaterialsFormControls.benaRegisteredVendorID) || '',
    hasLocalAgent,
    localAgentDetails:
      hasLocalAgent === true
        ? (localAgentInfoGroup?.get(EMaterialsFormControls.localAgentDetails)?.value || undefined)
        : undefined,
  };

  let localAgentDetailSection: LocalAgentDetailSection | undefined;
  if (hasLocalAgent === true) {
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
      // Use service ID from cover page (source of truth), fallback to overview's synced ID
      const overviewServiceId = detailGroup.get(EMaterialsFormControls.serviceId)?.value || '';
      const serviceId = coverPageServiceIds[i] || overviewServiceId;
      const methodology = getControlValue(detailGroup, EMaterialsFormControls.serviceLocalizationMethodology);

      services.push({
        id: serviceId,
        serviceName: getControlValue(detailGroup, EMaterialsFormControls.serviceName) || '',
        serviceDescription: getControlValue(detailGroup, EMaterialsFormControls.serviceDescription) || '',
        serviceType: toNumberOrEmpty(getControlValue(detailGroup, EMaterialsFormControls.serviceType)),
        serviceCategory: toNumberOrEmpty(getControlValue(detailGroup, EMaterialsFormControls.serviceCategory)),
        serviceProvidedTo: toNumberOrEmpty(getControlValue(detailGroup, EMaterialsFormControls.serviceProvidedTo)),
        targetedForLocalization: toBooleanYesNoOrUndefined(
          getControlValue(detailGroup, EMaterialsFormControls.serviceTargetedForLocalization)
        ),
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
  const attachmentsGroup = formService.attachmentsFormGroup;

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
        id: getControlValue(companyGroup, EMaterialsFormControls.rowId) || '',
        companyName: getControlValue(companyGroup, EMaterialsFormControls.saudiCompanyName) || '',
        vendorIdWithSEC: getControlValue(companyGroup, EMaterialsFormControls.registeredVendorIDwithSEC) || '',
        benaRegisterVendorId: getControlValue(companyGroup, EMaterialsFormControls.benaRegisteredVendorID) || '',
        companyType: toNumberArray(getControlValue(companyGroup, EMaterialsFormControls.companyType)),
        qualificationStatus: toNumberOrEmpty(getControlValue(companyGroup, EMaterialsFormControls.qualificationStatus)),
        companyOverview: getControlValue(companyGroup, EMaterialsFormControls.companyOverview) || '',
        companyOverviewOther: getControlValue(companyGroup, EMaterialsFormControls.companyOverviewOther) || '',
        companyOverviewKeyProjectDetails: getControlValue(companyGroup, EMaterialsFormControls.companyOverviewKeyProjectDetails) || '',
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
        id: getControlValue(partnerGroup, EMaterialsFormControls.rowId),
        agreementType: toNumberOrEmpty(getControlValue(partnerGroup, EMaterialsFormControls.agreementType)),
        otherAgreementType: getControlValue(partnerGroup, EMaterialsFormControls.agreementOtherDetails) || undefined,
        agreementSigningDate: getControlValue(partnerGroup, EMaterialsFormControls.agreementSigningDate) || '',
        agreementCopyProvided: toBooleanYesNoOrUndefined(getControlValue(partnerGroup, EMaterialsFormControls.provideAgreementCopy)),
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

    const y1Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.firstYear}_headcount`));
    const y1Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.firstYear}_saudization`));
    const y2Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.secondYear}_headcount`));
    const y2Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.secondYear}_saudization`));
    const y3Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.thirdYear}_headcount`));
    const y3Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.thirdYear}_saudization`));
    const y4Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fourthYear}_headcount`));
    const y4Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fourthYear}_saudization`));
    const y5Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fifthYear}_headcount`));
    const y5Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fifthYear}_saudization`));

    const hasEntityValues = [
      y1Headcount, y1Saudization, y2Headcount, y2Saudization, y3Headcount, y3Saudization, y4Headcount, y4Saudization, y5Headcount, y5Saudization,
    ].some((v) => typeof v === 'number');

    if (hasEntityValues) {
      result.entityHeadcounts.push({
        id: entityGroup.get(EMaterialsFormControls.rowId)?.value || undefined,
        pageNumber: 3,
        y1Headcount,
        y1Saudization,
        y2Headcount,
        y2Saudization,
        y3Headcount,
        y3Saudization,
        y4Headcount,
        y4Saudization,
        y5Headcount,
        y5Saudization,
      });
    }
  }

  // Map Service Headcounts (Page 3 - Existing Saudi)
  if (serviceLevelArray && serviceLevelArray.length > 0) {
    result.serviceHeadcounts = result.serviceHeadcounts || [];
    for (let i = 0; i < serviceLevelArray.length; i++) {
      const serviceGroup = serviceLevelArray.at(i) as FormGroup;
      const serviceId = serviceGroup.get(EMaterialsFormControls.serviceId)?.value || '';

      const measuresUpSkillSaudis = getControlValue(serviceGroup, EMaterialsFormControls.keyMeasuresToUpskillSaudis) || '';
      const mentionSupportRequiredSEC = getControlValue(serviceGroup, EMaterialsFormControls.mentionSupportRequiredFromSEC) || '';
      // Get localizationDate from the service level table (sent as LocalizationDate to backend)
      const localizationDate = getControlValue(serviceGroup, EMaterialsFormControls.expectedLocalizationDate) || '';
      const y1Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.firstYear}_headcount`));
      const y1Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.firstYear}_saudization`));
      const y2Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.secondYear}_headcount`));
      const y2Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.secondYear}_saudization`));
      const y3Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.thirdYear}_headcount`));
      const y3Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.thirdYear}_saudization`));
      const y4Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fourthYear}_headcount`));
      const y4Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fourthYear}_saudization`));
      const y5Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fifthYear}_headcount`));
      const y5Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fifthYear}_saudization`));

      const hasServiceValues = [
        y1Headcount, y1Saudization, y2Headcount, y2Saudization, y3Headcount, y3Saudization, y4Headcount, y4Saudization, y5Headcount, y5Saudization,
      ].some((v) => typeof v === 'number')
        || (measuresUpSkillSaudis && measuresUpSkillSaudis.toString().trim() !== '')
        || (mentionSupportRequiredSEC && mentionSupportRequiredSEC.toString().trim() !== '')
        || (localizationDate && localizationDate.toString().trim() !== '');

      if (hasServiceValues) {
        result.serviceHeadcounts.push({
          id: serviceGroup.get(EMaterialsFormControls.rowId)?.value || undefined,
          planServiceTypeId: serviceId,
          measuresUpSkillSaudis,
          mentionSupportRequiredSEC,
          localizationDate: localizationDate || undefined, // Include localizationDate for service level table
          pageNumber: 3,
          y1Headcount,
          y1Saudization,
          y2Headcount,
          y2Saudization,
          y3Headcount,
          y3Saudization,
          y4Headcount,
          y4Saudization,
          y5Headcount,
          y5Saudization,
        });
      }
    }
  }

  // Map Attachments (from existing saudi step)
  if (attachmentsGroup) {
    const attachmentFiles = getControlValue(attachmentsGroup, EMaterialsFormControls.attachments, true);
    if (attachmentFiles && Array.isArray(attachmentFiles) && attachmentFiles.length > 0) {
      result.attachments = [];
      attachmentFiles.forEach((file: File) => {
        result.attachments!.push({
          id: (file as any).id || undefined, // Preserve ID for existing attachments
          fileName: file.name,
          fileExtension: (file as any).fileExtension || file.name.split('.').pop() || '',
          fileUrl: (file as any).fileUrl || undefined,
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
} {
  const localizationArray = formService.directLocalizationServiceLevelFormGroup;
  const entityLevelArray = formService.directLocalizationEntityLevelFormGroup;
  const serviceLevelArray = formService.directLocalizationServiceLevelFormGroup;

  const result: {
    localizationStrategies?: LocalizationStrategy[];
    entityHeadcounts?: EntityHeadcount[];
    serviceHeadcounts?: ServiceHeadcount[];
  } = {};

  // Map Localization Strategies
  if (localizationArray && localizationArray.length > 0) {
    result.localizationStrategies = [];
    for (let i = 0; i < localizationArray.length; i++) {
      const strategyGroup = localizationArray.at(i) as FormGroup;
      const serviceId = strategyGroup.get(EMaterialsFormControls.serviceId)?.value || '';

      const localizationApproach = toNumberOrEmpty(getControlValue(strategyGroup, EMaterialsFormControls.localizationApproach));
      const locationType = toNumberOrEmpty(getControlValue(strategyGroup, EMaterialsFormControls.location));
      const expectedLocalizationDate = getControlValue(strategyGroup, EMaterialsFormControls.expectedLocalizationDate) || '';
      const capexRequired = toNumberOrEmpty(getControlValue(strategyGroup, EMaterialsFormControls.capexRequired));
      const hasProprietaryTools = toBooleanYesNoOrUndefined(
        getControlValue(strategyGroup, EMaterialsFormControls.willBeAnyProprietaryToolsSystems)
      );
      const proprietaryToolsDetails = getControlValue(strategyGroup, EMaterialsFormControls.proprietaryToolsSystemsDetails) || undefined;
      const governmentSupervision = getControlValue(strategyGroup, EMaterialsFormControls.supervisionOversightEntity) || undefined;
      const otherLocalizationApproach = getControlValue(strategyGroup, EMaterialsFormControls.localizationApproachOtherDetails) || undefined;
      const otherLocationType = getControlValue(strategyGroup, EMaterialsFormControls.locationOtherDetails) || undefined;

      const trimmedValue = (s: string) => s.toString().trim();

      // before pushing to request payload, we need to make sure the table has at least one valid value
      const hasValues = [localizationApproach, locationType, capexRequired].some((v) => typeof v === 'number')
        || (expectedLocalizationDate && trimmedValue(expectedLocalizationDate) !== '')
        || hasProprietaryTools !== undefined
        || (proprietaryToolsDetails && trimmedValue(proprietaryToolsDetails) !== '')
        || (governmentSupervision && trimmedValue(governmentSupervision) !== '')
        || (otherLocalizationApproach && trimmedValue(otherLocalizationApproach) !== '')
        || (otherLocationType && trimmedValue(otherLocationType) !== '');

      if (hasValues) {
        result.localizationStrategies.push({
          id: getControlValue(strategyGroup, EMaterialsFormControls.rowId),
          planServiceTypeId: serviceId,
          localizationApproach,
          locationType,
          expectedLocalizationDate,
          capexRequired,
          hasProprietaryTools,
          proprietaryToolsDetails: hasProprietaryTools ? proprietaryToolsDetails : undefined,
          governmentSupervision,
          otherLocalizationApproach,
          otherLocationType,
        });
      }
    }
  }

  // Map Entity Headcounts (Page 4 - Direct Localization)
  if (entityLevelArray && entityLevelArray.length > 0) {
    result.entityHeadcounts = [];
    const entityGroup = entityLevelArray.at(0) as FormGroup;

    const y1Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.firstYear}_headcount`));
    const y1Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.firstYear}_saudization`));
    const y2Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.secondYear}_headcount`));
    const y2Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.secondYear}_saudization`));
    const y3Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.thirdYear}_headcount`));
    const y3Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.thirdYear}_saudization`));
    const y4Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fourthYear}_headcount`));
    const y4Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fourthYear}_saudization`));
    const y5Headcount = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fifthYear}_headcount`));
    const y5Saudization = toNumberOrEmpty(getControlValue(entityGroup, `${EMaterialsFormControls.fifthYear}_saudization`));

    const hasEntityValues = [
      y1Headcount, y1Saudization, y2Headcount, y2Saudization, y3Headcount, y3Saudization, y4Headcount, y4Saudization, y5Headcount, y5Saudization,
    ].some((v) => typeof v === 'number');

    if (hasEntityValues) {
      result.entityHeadcounts.push({
        id: entityGroup.get(EMaterialsFormControls.rowId)?.value || undefined,
        pageNumber: 4,
        y1Headcount,
        y1Saudization,
        y2Headcount,
        y2Saudization,
        y3Headcount,
        y3Saudization,
        y4Headcount,
        y4Saudization,
        y5Headcount,
        y5Saudization,
      });
    }
  }

  // Map Service Headcounts (Page 4 - Direct Localization)
  if (serviceLevelArray && serviceLevelArray.length > 0) {
    result.serviceHeadcounts = result.serviceHeadcounts || [];
    for (let i = 0; i < serviceLevelArray.length; i++) {
      const serviceGroup = serviceLevelArray.at(i) as FormGroup;
      const serviceId = serviceGroup.get(EMaterialsFormControls.serviceId)?.value || '';

      const measuresUpSkillSaudis = getControlValue(serviceGroup, EMaterialsFormControls.keyMeasuresToUpskillSaudis) || '';
      const mentionSupportRequiredSEC = getControlValue(serviceGroup, EMaterialsFormControls.mentionSupportRequiredFromSEC) || '';
      // Get localizationDate from the service level table's separate control (sent as LocalizationDate to backend)
      // In Step 4, service level table uses serviceLevelLocalizationDate, while localization strategy uses expectedLocalizationDate
      const localizationDate = getControlValue(serviceGroup, EMaterialsFormControls.serviceLevelLocalizationDate) || '';
      const y1Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.firstYear}_headcount`));
      const y1Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.firstYear}_saudization`));
      const y2Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.secondYear}_headcount`));
      const y2Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.secondYear}_saudization`));
      const y3Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.thirdYear}_headcount`));
      const y3Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.thirdYear}_saudization`));
      const y4Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fourthYear}_headcount`));
      const y4Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fourthYear}_saudization`));
      const y5Headcount = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fifthYear}_headcount`));
      const y5Saudization = toNumberOrEmpty(getControlValue(serviceGroup, `${EMaterialsFormControls.fifthYear}_saudization`));

      const hasServiceValues = [
        y1Headcount, y1Saudization, y2Headcount, y2Saudization, y3Headcount, y3Saudization, y4Headcount, y4Saudization, y5Headcount, y5Saudization,
      ].some((v) => typeof v === 'number')
        || (measuresUpSkillSaudis && measuresUpSkillSaudis.toString().trim() !== '')
        || (mentionSupportRequiredSEC && mentionSupportRequiredSEC.toString().trim() !== '')
        || (localizationDate && localizationDate.toString().trim() !== '');

      if (hasServiceValues) {
        result.serviceHeadcounts.push({
          id: serviceGroup.get(EMaterialsFormControls.rowId)?.value || undefined,
          planServiceTypeId: serviceId,
          measuresUpSkillSaudis,
          mentionSupportRequiredSEC,
          localizationDate: localizationDate || undefined, // Include localizationDate for service level table
          pageNumber: 4,
          y1Headcount,
          y1Saudization,
          y2Headcount,
          y2Saudization,
          y3Headcount,
          y3Saudization,
          y4Headcount,
          y4Saudization,
          y5Headcount,
          y5Saudization,
        });
      }
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
  signature?: Signature,
  options?: {
    includeExistingSaudi?: boolean;
    includeDirectLocalization?: boolean;
  }
): IServiceLocalizationPlanRequest {
  const includeExistingSaudi = options?.includeExistingSaudi ?? true;
  const includeDirectLocalization = options?.includeDirectLocalization ?? true;

  const basicInfoGroup = formService.basicInformationFormGroup;
  const coverCompanyInfoGroup = formService.coverPageCompanyInformationFormGroup;

  // Get opportunity ID and plan title
  const opportunityId = basicInfoGroup?.get(EMaterialsFormControls.opportunity)?.value || '';
  const planTitle = getControlValue(coverCompanyInfoGroup, EMaterialsFormControls.planTitle) || '';

  // Map services and company info
  const { services, companyInformationSection, localAgentDetailSection } = mapServicesAndCompanyInfo(formService);

  // Map existing saudi data
  const existingSaudiData = includeExistingSaudi ? mapExistingSaudiData(formService) : undefined;

  // Map direct localization data
  const directLocalizationData = includeDirectLocalization ? mapDirectLocalizationData(formService) : undefined;

  // Combine entity headcounts and service headcounts from available steps only
  const allEntityHeadcounts = [
    ...(existingSaudiData?.entityHeadcounts || []),
    ...(directLocalizationData?.entityHeadcounts || []),
  ];

  const allServiceHeadcounts = [
    ...(existingSaudiData?.serviceHeadcounts || []),
    ...(directLocalizationData?.serviceHeadcounts || []),
  ];

  // Attachments come from the Existing Saudi step (Step 3)
  const allAttachments = existingSaudiData?.attachments || [];

  const servicePlan: ServicePlan = {
    id: planId,
    opportunityId,
    planTitle,
    services,
    companyInformationSection,
    localAgentDetailSection,
    saudiCompanyDetails: includeExistingSaudi ? existingSaudiData?.saudiCompanyDetails : undefined,
    partnershipModels: includeExistingSaudi ? existingSaudiData?.partnershipModels : undefined,
    entityHeadcounts: allEntityHeadcounts.length > 0 ? allEntityHeadcounts : undefined,
    serviceHeadcounts: allServiceHeadcounts.length > 0 ? allServiceHeadcounts : undefined,
    attachments: allAttachments.length > 0 ? allAttachments : undefined,
    localizationStrategies: includeDirectLocalization ? directLocalizationData?.localizationStrategies : undefined,
  };

  const signatureData = signature || createPlaceholderSignature();

  return {
    servicePlan,
    signature: signatureData,
  };
}

function stripEmptyFormDataFields(formData: FormData): void {
  const keysToDelete = new Set<string>();
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && value.trim() === '') {
      keysToDelete.add(key);
    }
  }
  keysToDelete.forEach((key) => formData.delete(key));
}

/**
 * Convert IServiceLocalizationPlanRequest to FormData
 */
export function convertServiceRequestToFormData(
  request: IServiceLocalizationPlanRequest,
  options?: {
    stripEmpty?: boolean;
  }
): FormData {
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
    if (service.targetedForLocalization !== undefined && service.targetedForLocalization !== null) {
      formData.append(
        `ServicePlan.Services[${index}].TargetedForLocalization`,
        service.targetedForLocalization.toString()
      );
    }
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
  if (companyInfo.hasLocalAgent !== undefined && companyInfo.hasLocalAgent !== null) {
    formData.append('ServicePlan.CompanyInformationSection.HasLocalAgent', companyInfo.hasLocalAgent.toString());
  }
  if (companyInfo.localAgentDetails) {
    formData.append('ServicePlan.CompanyInformationSection.LocalAgentDetails', companyInfo.localAgentDetails);
  }

  // Add local agent detail section if present
  if (servicePlan.localAgentDetailSection) {
    const agent = servicePlan.localAgentDetailSection;
    const agentContact = agent.agentContactNumber as unknown as {countryCode: string, phoneNumber: string}

    formData.append('ServicePlan.LocalAgentDetailSection.LocalAgentName', agent.localAgentName);
    formData.append('ServicePlan.LocalAgentDetailSection.AgentContactPerson', agent.agentContactPerson);
    formData.append('ServicePlan.LocalAgentDetailSection.AgentEmail', agent.agentEmail);
    formData.append('ServicePlan.LocalAgentDetailSection.AgentContactNumber', agentContact.countryCode + agentContact.phoneNumber);
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
      formData.append(`ServicePlan.SaudiCompanyDetails[${index}].CompanyOverviewOther`, company.companyOverviewOther);
      if (company.companyOverviewKeyProjectDetails) {
        formData.append(
          `ServicePlan.SaudiCompanyDetails[${index}].CompanyOverviewKeyProjectDetails`,
          company.companyOverviewKeyProjectDetails
        );
      }
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
      if (partnership.agreementCopyProvided !== undefined && partnership.agreementCopyProvided !== null) {
        formData.append(`ServicePlan.PartnershipModels[${index}].AgreementCopyProvided`, partnership.agreementCopyProvided.toString());
      }
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
      if (service.id) formData.append(`ServicePlan.ServiceHeadcounts[${index}].id`, service.id)
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].PlanServiceTypeId`, service.planServiceTypeId);
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].MeasuresUpSkillSaudis`, service.measuresUpSkillSaudis);
      formData.append(`ServicePlan.ServiceHeadcounts[${index}].MentionSupportRequiredSEC`, service.mentionSupportRequiredSEC);
      // Send localizationDate as LocalizationDate for service level tables in steps 3 & 4
      if (service.localizationDate) {
        formData.append(`ServicePlan.ServiceHeadcounts[${index}].LocalizationDate`, service.localizationDate);
      }
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

  // Add attachments if present - append as structured objects with metadata and file
  if (servicePlan.attachments && servicePlan.attachments.length > 0) {
    servicePlan.attachments.forEach((attachment, index) => {
      // Append attachment metadata fields as structured object properties
      if (attachment.id) {
        formData.append(`ServicePlan.Attachments[${index}].Id`, attachment.id);
      }
      formData.append(`ServicePlan.Attachments[${index}].FileName`, attachment.fileName);
      if (attachment.fileExtension) {
        formData.append(`ServicePlan.Attachments[${index}].FileExtension`, attachment.fileExtension);
      }
      if (attachment.fileUrl) {
        formData.append(`ServicePlan.Attachments[${index}].FileUrl`, attachment.fileUrl);
      }

      const fileValue: any = attachment.file;

      // Handle the file data
      if (fileValue) {
        // Check if it's a File object - append as binary with proper field name
        if (fileValue instanceof File) {
          // File object - append as binary with the structured field name
          formData.append(`ServicePlan.Attachments[${index}].File`, fileValue);
        } else if (typeof fileValue === 'object' && 'size' in fileValue && 'type' in fileValue && 'name' in fileValue) {
          // Duck typing for File-like object - append as binary
          formData.append(`ServicePlan.Attachments[${index}].File`, fileValue as File);
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
            formData.append(`ServicePlan.Attachments[${index}].File`, fileStringValue);
          }
        }
      }
    });
  }

  // Add localization strategies if condition met and present
  if (servicePlan.localizationStrategies) {
    servicePlan.localizationStrategies.forEach((strategy, index) => {
      if (strategy.id) formData.append(`ServicePlan.LocalizationStrategies[${index}].Id`, strategy.id);
      formData.append(`ServicePlan.LocalizationStrategies[${index}].PlanServiceTypeId`, strategy.planServiceTypeId);
      formData.append(`ServicePlan.LocalizationStrategies[${index}].LocalizationApproach`, strategy.localizationApproach.toString());
      formData.append(`ServicePlan.LocalizationStrategies[${index}].LocationType`, strategy.locationType.toString());
      formData.append(`ServicePlan.LocalizationStrategies[${index}].ExpectedLocalizationDate`, strategy.expectedLocalizationDate);
      formData.append(`ServicePlan.LocalizationStrategies[${index}].CapexRequired`, strategy.capexRequired.toString());
      if (strategy.hasProprietaryTools !== undefined && strategy.hasProprietaryTools !== null) {
        formData.append(`ServicePlan.LocalizationStrategies[${index}].HasProprietaryTools`, strategy.hasProprietaryTools.toString());
      }
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

  if (options?.stripEmpty) {
    stripEmptyFormDataFields(formData);
  }

  return formData;
}
