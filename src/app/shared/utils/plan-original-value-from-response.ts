import { IFieldInformation } from '../interfaces/plans.interface';
import {
  IServiceLocalizationPlanResponse,
  IServicePlanEntityHeadcount,
  IServicePlanLocalizationStrategy,
  IServicePlanPartnershipModel,
  IServicePlanResponse,
  IServicePlanSaudiCompanyDetail,
  IServicePlanServiceHeadcount,
  IServicePlanServiceItem,
} from '../interfaces/plans.interface';
import { IProductPlanResponse, ProductPlan, ValueChainRow, SaudizationRow } from '../interfaces/plans.interface';
import { EMaterialsFormControls } from '../enums';

function stripIndexSuffix(inputKey: string): string {
  const match = inputKey.match(/^(.+)_(\d+)$/);
  return match ? match[1] : inputKey;
}

function findByPage<T extends { pageNumber?: number }>(items: T[] | undefined, pageNumber: number): T | undefined {
  return (items ?? []).find((x) => x.pageNumber === pageNumber);
}

function toYesNoId(value: boolean | null | undefined): string | null {
  if (value == null) return null;
  return value ? '1' : '2';
}

const VALUE_CHAIN_SECTION_TYPE: Record<string, number> = {
  designEngineering: 1,
  sourcing: 2,
  manufacturing: 3,
  assemblyTesting: 4,
  afterSales: 5,
};

/**
 * Get the original value of a field from the Service plan BE response.
 * Used for before/after comparison in resubmit mode.
 */
export function getFieldValueFromServicePlanResponse(
  field: IFieldInformation,
  response: IServiceLocalizationPlanResponse | null
): any {
  if (!response?.servicePlan) return undefined;
  const sp: IServicePlanResponse = response.servicePlan;
  const { section, inputKey, id: rowId } = field;
  const key = stripIndexSuffix(inputKey);

  // Cover: companyInformation / coverPageCompanyInformation
  if (section === 'companyInformation' || section === 'coverPageCompanyInformation') {
    const c = sp.companyInformationSection;
    if (!c) return undefined;
    if (key === EMaterialsFormControls.planTitle) return sp.planTitle ?? undefined;
    if (key === EMaterialsFormControls.companyName) return c.companyName ?? undefined;
    return undefined;
  }

  // Cover & Overview: services / serviceDetails (array by id)
  if ((section === 'services' || section === 'serviceDetails') && rowId) {
    const svc: IServicePlanServiceItem | undefined = (sp.services ?? []).find((s) => s.id === rowId);
    if (!svc) return undefined;
    if (key === EMaterialsFormControls.serviceName) return svc.serviceName ?? undefined;
    if (key === EMaterialsFormControls.serviceType) return svc.serviceType != null ? String(svc.serviceType) : undefined;
    if (key === EMaterialsFormControls.serviceCategory) return svc.serviceCategory != null ? String(svc.serviceCategory) : undefined;
    if (key === EMaterialsFormControls.serviceDescription) return svc.serviceDescription ?? undefined;
    if (key === EMaterialsFormControls.serviceProvidedTo) return Array.isArray(svc.serviceProvidedTo) ? svc.serviceProvidedTo.map((x) => String(x)) : undefined;
    if (key === EMaterialsFormControls.totalBusinessDoneLast5Years) return svc.totalBusinessLast5Years ?? undefined;
    if (key === EMaterialsFormControls.serviceTargetedForLocalization) return toYesNoId(!!svc.targetedForLocalization);
    if (key === EMaterialsFormControls.serviceLocalizationMethodology) return (svc.serviceLocalizationMethodology ?? [])?.map((x) => String(x))?.[0];
    if (key === EMaterialsFormControls.serviceProvidedToCompanyNames) return svc.otherProvidedTo ?? undefined;
    if (key === EMaterialsFormControls.expectedLocalizationDate) return svc.expectedLocalizationDate ?? undefined;
    return undefined;
  }

  // Overview: overviewCompanyInformation -> companyInformationSection
  if (section === 'overviewCompanyInformation') {
    const c = sp.companyInformationSection;
    if (!c) return undefined;
    if (key === EMaterialsFormControls.companyName) return c.companyName ?? undefined;
    if (key === EMaterialsFormControls.ceoName) return c.ceoName ?? undefined;
    if (key === EMaterialsFormControls.ceoEmailID) return c.ceoEmail ?? undefined;
    return undefined;
  }

  // Overview: locationInformation -> companyInformationSection
  if (section === 'locationInformation') {
    const c = sp.companyInformationSection;
    if (!c) return undefined;
    if (key === EMaterialsFormControls.globalHQLocation) return c.globalHQLocation ?? undefined;
    if (key === EMaterialsFormControls.registeredVendorIDwithSEC) return c.secVendorId ?? undefined;
    if (key === EMaterialsFormControls.benaRegisteredVendorID) return c.benaVendorId ?? undefined;
    if (key === EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA) return toYesNoId(c.hasLocalAgent);
    return undefined;
  }

  // Overview: localAgentInformation -> localAgentDetailSection + companyInformationSection.localAgentDetails
  if (section === 'localAgentInformation') {
    const a = sp.localAgentDetailSection;
    const c = sp.companyInformationSection;
    if (key === EMaterialsFormControls.localAgentDetails) return c?.localAgentDetails ?? undefined;
    if (!a) return undefined;
    if (key === EMaterialsFormControls.localAgentName) return a.localAgentName ?? undefined;
    if (key === EMaterialsFormControls.contactPersonName) return a.agentContactPerson ?? undefined;
    if (key === EMaterialsFormControls.emailID) return a.agentEmail ?? undefined;
    if (key === EMaterialsFormControls.contactNumber) return a.agentContactNumber ?? undefined;
    if (key === EMaterialsFormControls.companyLocation) return a.agentCompanyLocation ?? undefined;
    return undefined;
  }

  // Overview: basicInformation (submissionDate, opportunity – from response; planTitle from servicePlan)
  if (section === 'basicInformation') {
    if (key === EMaterialsFormControls.planTitle) return sp.planTitle ?? undefined;
    if (key === EMaterialsFormControls.submissionDate) return response.submissionDate ? new Date(response.submissionDate) : undefined;
    return undefined;
  }

  // Existing Saudi: saudiCompanyDetails
  if (section === 'saudiCompanyDetails' && rowId) {
    const co: IServicePlanSaudiCompanyDetail | undefined = (sp.saudiCompanyDetails ?? []).find((x) => x.id === rowId);
    if (!co) return undefined;
    if (key === EMaterialsFormControls.saudiCompanyName) return co.companyName ?? undefined;
    if (key === EMaterialsFormControls.registeredVendorIDwithSEC) return co.vendorIdWithSEC ?? undefined;
    if (key === EMaterialsFormControls.benaRegisteredVendorID) return co.benaRegisterVendorId ?? undefined;
    if (key === EMaterialsFormControls.companyType) return (co.companyType ?? []).map((x) => String(x));
    if (key === EMaterialsFormControls.qualificationStatus) return co.qualificationStatus != null ? String(co.qualificationStatus) : undefined;
    if (key === EMaterialsFormControls.products) return co.products ?? undefined;
    if (key === EMaterialsFormControls.companyOverview) return co.companyOverview ?? undefined;
    if (key === EMaterialsFormControls.keyProjectsExecutedByContractorForSEC) return co.keyProjectsForSEC ?? undefined;
    if (key === EMaterialsFormControls.companyOverviewKeyProjectDetails) return co.companyOverviewKeyProjectDetails ?? undefined;
    if (key === EMaterialsFormControls.companyOverviewOther) return co.companyOverviewOther ?? undefined;
    return undefined;
  }

  // Existing Saudi: collaborationPartnership
  if (section === 'collaborationPartnership' && rowId) {
    const pm: IServicePlanPartnershipModel | undefined = (sp.partnershipModels ?? []).find((x) => x.id === rowId);
    if (!pm) return undefined;
    if (key === EMaterialsFormControls.agreementType || key === 'agreementTypeWithSaudiCompany') return pm.agreementType != null ? String(pm.agreementType) : undefined;
    if (key === EMaterialsFormControls.agreementSigningDate) return pm.agreementSigningDate ?? undefined;
    if (key === EMaterialsFormControls.agreementOtherDetails) return pm.otherAgreementType ?? undefined;
    if (key === EMaterialsFormControls.supervisionOversightEntity) return pm.supervisionEntity ?? undefined;
    if (key === EMaterialsFormControls.whyChoseThisCompany) return pm.selectionJustification ?? undefined;
    if (key === EMaterialsFormControls.summaryOfKeyAgreementClauses) return pm.keyAgreementClauses ?? undefined;
    if (key === EMaterialsFormControls.provideAgreementCopy) return toYesNoId(pm.agreementCopyProvided);
    return undefined;
  }

  // Existing Saudi / Direct: entityLevel (page 3 or 4) – find by rowId (entity id) or fallback to page
  if (section === 'entityLevel') {
    const entity: IServicePlanEntityHeadcount | undefined =
      (rowId ? (sp.entityHeadcounts ?? []).find((e: any) => e.id === rowId) : undefined) ??
      findByPage(sp.entityHeadcounts, 3) ??
      findByPage(sp.entityHeadcounts, 4);
    if (!entity) return undefined;
    const k = key.startsWith('entityLevel_') ? key.slice(12) : key;
    const yearMap: Record<string, keyof IServicePlanEntityHeadcount> = {
      [`${EMaterialsFormControls.firstYear}_headcount`]: 'y1Headcount',
      [`${EMaterialsFormControls.firstYear}_saudization`]: 'y1Saudization',
      [`${EMaterialsFormControls.secondYear}_headcount`]: 'y2Headcount',
      [`${EMaterialsFormControls.secondYear}_saudization`]: 'y2Saudization',
      [`${EMaterialsFormControls.thirdYear}_headcount`]: 'y3Headcount',
      [`${EMaterialsFormControls.thirdYear}_saudization`]: 'y3Saudization',
      [`${EMaterialsFormControls.fourthYear}_headcount`]: 'y4Headcount',
      [`${EMaterialsFormControls.fourthYear}_saudization`]: 'y4Saudization',
      [`${EMaterialsFormControls.fifthYear}_headcount`]: 'y5Headcount',
      [`${EMaterialsFormControls.fifthYear}_saudization`]: 'y5Saudization',
    };
    const yearKey = yearMap[k as keyof typeof yearMap];
    if (yearKey) return (entity as any)[yearKey];
    return undefined;
  }

  // Existing Saudi / Direct: serviceLevel (page 3 or 4) – rowId is headcount id or planServiceTypeId
  if (section === 'serviceLevel' && rowId) {
    const head: IServicePlanServiceHeadcount | undefined = (sp.serviceHeadcounts ?? []).find((h) => h.id === rowId) ??
      (sp.serviceHeadcounts ?? []).find((h) => h.planServiceTypeId === rowId);
    if (!head) return undefined;
    if (key === EMaterialsFormControls.expectedLocalizationDate || key === EMaterialsFormControls.serviceLevelLocalizationDate) return head.localizationDate ?? undefined;
    if (key === EMaterialsFormControls.keyMeasuresToUpskillSaudis) return head.measuresUpSkillSaudis ?? undefined;
    if (key === EMaterialsFormControls.mentionSupportRequiredFromSEC) return head.mentionSupportRequiredSEC ?? undefined;
    const yMap: Record<string, keyof IServicePlanServiceHeadcount> = {
      [`${EMaterialsFormControls.firstYear}_headcount`]: 'y1Headcount', [`${EMaterialsFormControls.firstYear}_saudization`]: 'y1Saudization',
      [`${EMaterialsFormControls.secondYear}_headcount`]: 'y2Headcount', [`${EMaterialsFormControls.secondYear}_saudization`]: 'y2Saudization',
      [`${EMaterialsFormControls.thirdYear}_headcount`]: 'y3Headcount', [`${EMaterialsFormControls.thirdYear}_saudization`]: 'y3Saudization',
      [`${EMaterialsFormControls.fourthYear}_headcount`]: 'y4Headcount', [`${EMaterialsFormControls.fourthYear}_saudization`]: 'y4Saudization',
      [`${EMaterialsFormControls.fifthYear}_headcount`]: 'y5Headcount', [`${EMaterialsFormControls.fifthYear}_saudization`]: 'y5Saudization',
    };
    const yKey = yMap[key as keyof typeof yMap];
    if (yKey) return (head as any)[yKey];
    return undefined;
  }

  // Existing Saudi: attachments
  if (section === 'attachments' && key === EMaterialsFormControls.attachments) {
    return sp.attachments ?? undefined;
  }

  // Direct: localizationStrategy
  if (section === 'localizationStrategy' && rowId) {
    const st: IServicePlanLocalizationStrategy | undefined = (sp.localizationStrategies ?? []).find((s) => s.id === rowId) ??
      (sp.localizationStrategies ?? []).find((s) => s.planServiceTypeId === rowId);
    if (!st) return undefined;
    if (key === EMaterialsFormControls.expectedLocalizationDate) return st.expectedLocalizationDate ?? undefined;
    if (key === EMaterialsFormControls.localizationApproach) return st.localizationApproach != null ? String(st.localizationApproach) : undefined;
    if (key === EMaterialsFormControls.localizationApproachOtherDetails) return st.otherLocalizationApproach ?? undefined;
    if (key === EMaterialsFormControls.location || key === 'locationType') return st.locationType != null ? String(st.locationType) : undefined;
    if (key === EMaterialsFormControls.locationOtherDetails) return st.otherLocationType ?? undefined;
    if (key === EMaterialsFormControls.capexRequired || key === 'capexRequired (InSAR)') return st.capexRequired ?? undefined;
    if (key === EMaterialsFormControls.supervisionOversightByGovernmentEntity) return st.governmentSupervision ?? undefined;
    if (key === EMaterialsFormControls.willBeAnyProprietaryToolsSystems) return toYesNoId(st.hasProprietaryTools);
    if (key === EMaterialsFormControls.proprietaryToolsSystemsDetails) return st.proprietaryToolsDetails ?? undefined;
    return undefined;
  }

  return undefined;
}

/**
 * Get the original value of a field from the Product plan BE response.
 * Used for before/after comparison in resubmit mode.
 */
export function getFieldValueFromProductPlanResponse(
  field: IFieldInformation,
  response: IProductPlanResponse | null
): any {
  if (!response?.productPlan) return undefined;
  const pp: ProductPlan = response.productPlan;
  const { section, inputKey, id: rowId } = field;
  const key = stripIndexSuffix(inputKey);

  // Step 1: companyInformation -> overviewCompanyInfo.companyInfo
  if (section === 'companyInformation') {
    const c = pp.overviewCompanyInfo?.companyInfo;
    if (!c) return undefined;
    if (key === EMaterialsFormControls.companyName) return c.companyName ?? undefined;
    if (key === EMaterialsFormControls.ceoName) return c.ceoName ?? undefined;
    if (key === EMaterialsFormControls.ceoEmailID) return c.ceoEmail ?? undefined;
    return undefined;
  }

  // Step 1: locationInformation -> overviewCompanyInfo.locationInfo
  if (section === 'locationInformation') {
    const loc = pp.overviewCompanyInfo?.locationInfo;
    if (!loc) return undefined;
    if (key === EMaterialsFormControls.globalHQLocation) return loc.globalHQLocation ?? undefined;
    if (key === EMaterialsFormControls.registeredVendorIDwithSEC) return loc.vendorIdWithSEC ?? undefined;
    if (key === EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA) return loc.hasLocalAgent ?? undefined;
    return undefined;
  }

  // Step 1: localAgentInformation -> overviewCompanyInfo.locationInfo (when hasLocalAgent)
  if (section === 'localAgentInformation') {
    const loc = pp.overviewCompanyInfo?.locationInfo;
    if (!loc) return undefined;
    if (key === EMaterialsFormControls.localAgentName) return loc.localAgentName ?? undefined;
    if (key === EMaterialsFormControls.contactPersonName) return loc.contactPersonName ?? undefined;
    if (key === EMaterialsFormControls.emailID) return loc.localAgentEmail ?? undefined;
    if (key === EMaterialsFormControls.contactNumber) return loc.localAgentContactNumber ?? undefined;
    if (key === EMaterialsFormControls.companyHQLocation) return loc.companyHQLocation ?? undefined;
    return undefined;
  }

  // Step 1: basicInformation -> overviewCompanyInfo.basicInfo
  if (section === 'basicInformation') {
    const b = pp.overviewCompanyInfo?.basicInfo;
    if (!b) return undefined;
    if (key === EMaterialsFormControls.planTitle) return b.planTitle ?? undefined;
    if (key === EMaterialsFormControls.opportunityType) return b.opportunityType != null ? String(b.opportunityType) : undefined;
    if (key === EMaterialsFormControls.opportunity) return (b.opportunityId && b.opportunityTitle) ? { id: b.opportunityId, name: b.opportunityTitle } : undefined;
    if (key === EMaterialsFormControls.submissionDate) return b.createdDate ? new Date(b.createdDate) : undefined;
    return undefined;
  }

  // Step 2: overview -> productPlantOverview.overview
  if (section === 'overview') {
    const o = pp.productPlantOverview?.overview;
    if (!o) return undefined;
    if (key === EMaterialsFormControls.productName) return o.productName ?? undefined;
    if (key === EMaterialsFormControls.productSpecifications) return o.productSpecifications ?? undefined;
    if (key === EMaterialsFormControls.targetedAnnualPlantCapacity) return o.targetedAnnualPlantCapacity ?? undefined;
    if (key === EMaterialsFormControls.timeRequiredToSetupFactory) return o.timeRequiredToSetupFactory ?? undefined;
    return undefined;
  }

  // Step 2: expectedCAPEXInvestment -> productPlantOverview.expectedCapex
  if (section === 'expectedCAPEXInvestment') {
    const cap = pp.productPlantOverview?.expectedCapex;
    if (!cap) return undefined;
    if (key === EMaterialsFormControls.landPercentage) return cap.landPercent ?? undefined;
    if (key === EMaterialsFormControls.buildingPercentage) return cap.buildingPercent ?? undefined;
    if (key === EMaterialsFormControls.machineryEquipmentPercentage) return cap.machineryPercent ?? undefined;
    if (key === EMaterialsFormControls.othersPercentage) return cap.othersPercent ?? undefined;
    if (key === EMaterialsFormControls.othersDescription) return cap.othersDescription ?? undefined;
    return undefined;
  }

  // Step 2: targetCustomers -> productPlantOverview.targetCustomers
  if (section === 'targetCustomers') {
    const tc = pp.productPlantOverview?.targetCustomers;
    if (!tc) return undefined;
    if (key === EMaterialsFormControls.targetedCustomer) {
      const arr = (tc.targetSEC ?? []).map((x) => String(x));
      if (tc.targetLocalSuppliers && !arr.includes('2')) arr.push('2');
      return arr;
    }
    if (key === EMaterialsFormControls.namesOfTargetedSuppliers) return tc.targetedLocalSupplierNames ?? undefined;
    if (key === EMaterialsFormControls.productsUtilizeTargetedProduct) return tc.productsUtilizingTargetProduct ?? undefined;
    return undefined;
  }

  // Step 2: productManufacturingExperience -> productPlantOverview.manufacturingExperience
  if (section === 'productManufacturingExperience') {
    const m = pp.productPlantOverview?.manufacturingExperience;
    if (!m) return undefined;
    if (key === EMaterialsFormControls.productManufacturingExperience) return m.experienceRange != null ? String(m.experienceRange) : undefined;
    if (key === EMaterialsFormControls.provideToSEC) return m.provideToSEC ?? undefined;
    if (key === EMaterialsFormControls.provideToLocalSuppliers) return m.provideToLocalSuppliers ?? undefined;
    if (key === EMaterialsFormControls.qualifiedPlantLocationSEC) return m.qualifiedPlantLocation_SEC ?? undefined;
    if (key === EMaterialsFormControls.approvedVendorIDSEC) return m.approvedVendorId_SEC ?? undefined;
    if (key === EMaterialsFormControls.yearsOfExperienceSEC) return m.yearsExperience_SEC ?? undefined;
    if (key === EMaterialsFormControls.totalQuantitiesSEC) return m.totalQuantitiesToSEC ?? undefined;
    if (key === EMaterialsFormControls.namesOfSECApprovedSuppliers) return m.localSupplierNames ?? undefined;
    if (key === EMaterialsFormControls.qualifiedPlantLocation) return m.qualifiedPlantLocation_LocalSupplier ?? undefined;
    if (key === EMaterialsFormControls.yearsOfExperience) return m.yearsExperience_LocalSupplier ?? undefined;
    if (key === EMaterialsFormControls.totalQuantities) return m.totalQuantitiesToLocalSuppliers ?? undefined;
    return undefined;
  }

  // Step 3: value chain sections (designEngineering, sourcing, manufacturing, assemblyTesting, afterSales)
  const vcSectionType = VALUE_CHAIN_SECTION_TYPE[section];
  if (vcSectionType != null && rowId) {
    const rows: ValueChainRow[] = pp.valueChainStep?.valueChainRows ?? [];
    const row: ValueChainRow | undefined = rows.find((r) => r.sectionType === vcSectionType && r.id === rowId);
    if (!row) return undefined;
    if (key === EMaterialsFormControls.expenseHeader) return row.expenseHeader ?? undefined;
    if (key === EMaterialsFormControls.inHouseOrProcured) return row.inHouseOrProcured != null ? String(row.inHouseOrProcured) : undefined;
    if (key === EMaterialsFormControls.costPercentage) return row.costPercent ?? undefined;
    if (key === EMaterialsFormControls.year1) return row.year1 ?? undefined;
    if (key === EMaterialsFormControls.year2) return row.year2 ?? undefined;
    if (key === EMaterialsFormControls.year3) return row.year3 ?? undefined;
    if (key === EMaterialsFormControls.year4) return row.year4 ?? undefined;
    if (key === EMaterialsFormControls.year5) return row.year5 ?? undefined;
    if (key === EMaterialsFormControls.year6) return row.year6 ?? undefined;
    if (key === EMaterialsFormControls.year7) return row.year7 ?? undefined;
    return undefined;
  }

  // Step 4: attachments
  if (section === 'attachments' && key === EMaterialsFormControls.attachments) {
    return pp.saudization?.attachments ?? undefined;
  }

  // Step 4: saudization rows (annualHeadcount, saudizationPercentage, etc.) – by rowId and key
  if (section === 'saudizationFormGroup' || section === 'saudization') {
    const sRows: SaudizationRow[] = pp.saudization?.saudizationRows ?? [];
    const sRow: SaudizationRow | undefined = rowId ? sRows.find((r) => (r as any).id === rowId) : undefined;
    if (sRow) {
      const yKey = key as keyof SaudizationRow;
      if (['year1','year2','year3','year4','year5','year6','year7','saudizationType'].includes(yKey)) return (sRow as any)[yKey];
    }
    // By type: annualHeadcount->1, saudizationPercentage->2, annualTotalCompensation->3, saudiCompensationPercentage->4
    const typeByKey: Record<string, number> = {
      [EMaterialsFormControls.annualHeadcount]: 1,
      [EMaterialsFormControls.saudizationPercentage]: 2,
      [EMaterialsFormControls.annualTotalCompensation]: 3,
      [EMaterialsFormControls.saudiCompensationPercentage]: 4,
    };
    const t = typeByKey[key];
    if (t != null) {
      const r = sRows.find((x) => x.saudizationType === t);
      if (r) return r; // whole row for matrix; individual year would need more context
    }
  }

  return undefined;
}
