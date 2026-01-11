/**
 * Enum for Materials Form Control Names
 * Used to avoid magic strings throughout the form service and components
 */
export enum EMaterialsFormControls {
  rowId = 'rowId',
  serviceHeadcountRowId = 'serviceHeadcountRowId', // Separate ID for service headcounts in Step 4

  // Step 1 - Main Form Groups
  basicInformationFormGroup = 'basicInformationFormGroup',
  companyInformationFormGroup = 'companyInformationFormGroup',
  locationInformationFormGroup = 'locationInformationFormGroup',
  localAgentInformationFormGroup = 'localAgentInformationFormGroup',
  comment = 'comment',

  // Basic Information Controls
  planTitle = 'planTitle',
  opportunityType = 'opportunityType',
  opportunity = 'opportunity',
  submissionDate = 'submissionDate',

  // Company Information Controls
  companyName = 'companyName',
  ceoName = 'ceoName',
  ceoEmailID = 'ceoEmailID',

  // Location Information Controls
  globalHQLocation = 'globalHQLocation',
  registeredVendorIDwithSEC = 'registeredVendorIDwithSEC',
  benaRegisteredVendorID = 'benaRegisteredVendorID',
  doYouCurrentlyHaveLocalAgentInKSA = 'doYouCurrentlyHaveLocalAgentInKSA',

  // Details of Service Provided (Overview)
  detailsOfServices = 'detailsOfServices',

  // Local Agent Information Controls
  localAgentDetails = 'localAgentDetails',
  localAgentName = 'localAgentName',
  contactPersonName = 'contactPersonName',
  emailID = 'emailID',
  contactNumber = 'contactNumber',
  companyLocation = 'companyLocation',
  companyHQLocation = 'companyHQLocation', // Keep for backward compatibility

  // Common nested controls (used in group-input-with-checkbox pattern)
  hasComment = 'hasComment',
  value = 'value',

  // Step 2 - Main Form Groups
  overviewFormGroup = 'overviewFormGroup',
  expectedCAPEXInvestmentFormGroup = 'expectedCAPEXInvestmentFormGroup',
  targetCustomersFormGroup = 'targetCustomersFormGroup',
  productManufacturingExperienceFormGroup = 'productManufacturingExperienceFormGroup',

  // Step 2 - Overview Controls
  productName = 'productName',
  productSpecifications = 'productSpecifications',
  targetedAnnualPlantCapacity = 'targetedAnnualPlantCapacity',
  timeRequiredToSetupFactory = 'timeRequiredToSetupFactory',

  // Step 2 - Expected CAPEX Investment Controls
  landPercentage = 'landPercentage',
  buildingPercentage = 'buildingPercentage',
  machineryEquipmentPercentage = 'machineryEquipmentPercentage',
  othersPercentage = 'othersPercentage',
  othersDescription = 'othersDescription',

  // Step 2 - Target Customers Controls
  targetedCustomer = 'targetedCustomer',
  namesOfTargetedSuppliers = 'namesOfTargetedSuppliers',
  productsUtilizeTargetedProduct = 'productsUtilizeTargetedProduct',

  // Step 2 - Product Manufacturing Experience Controls
  productManufacturingExperience = 'productManufacturingExperience',
  provideToSEC = 'provideToSEC',
  qualifiedPlantLocationSEC = 'qualifiedPlantLocationSEC',
  approvedVendorIDSEC = 'approvedVendorIDSEC',
  yearsOfExperienceSEC = 'yearsOfExperienceSEC',
  totalQuantitiesSEC = 'totalQuantitiesSEC',
  provideToLocalSuppliers = 'provideToLocalSuppliers',
  namesOfSECApprovedSuppliers = 'namesOfSECApprovedSuppliers',
  qualifiedPlantLocation = 'qualifiedPlantLocation',
  yearsOfExperience = 'yearsOfExperience',
  totalQuantities = 'totalQuantities',

  // Step 3 - Main Form Groups
  valueChainFormGroup = 'valueChainFormGroup',
  designEngineeringFormGroup = 'designEngineeringFormGroup',
  sourcingFormGroup = 'sourcingFormGroup',
  manufacturingFormGroup = 'manufacturingFormGroup',
  assemblyTestingFormGroup = 'assemblyTestingFormGroup',
  afterSalesFormGroup = 'afterSalesFormGroup',

  // Step 3 - Value Chain Item Controls (used in FormArray items)
  expenseHeader = 'expenseHeader',
  inHouseOrProcured = 'inHouseOrProcured',
  costPercentage = 'cost (%)',
  year1 = 'year1',
  year2 = 'year2',
  year3 = 'year3',
  year4 = 'year4',
  year5 = 'year5',
  year6 = 'year6',
  year7 = 'year7',

  // Step 4 - Main Form Groups
  saudizationFormGroup = 'saudizationFormGroup',
  attachmentsFormGroup = 'attachmentsFormGroup',

  // Step 4 - Saudization Controls (Fixed rows)
  annualHeadcount = 'annualHeadcount',
  saudizationPercentage = 'saudizationPercentage',
  annualTotalCompensation = 'annualTotalCompensation',
  saudiCompensationPercentage = 'saudiCompensationPercentage',

  // Step 4 - Attachments Controls
  attachments = 'attachments',

  // Service Plan - Step 1 (Cover Page) - Main Form Groups
  coverPageFormGroup = 'coverPageFormGroup',
  coverPageCompanyInformationFormGroup = 'coverPageCompanyInformationFormGroup',
  servicesFormGroup = 'servicesFormGroup',

  // Service Plan - Step 1 (Cover Page) - Controls
  serviceId = 'serviceId',
  serviceName = 'serviceName',

  // Service Plan - Step 2 (Overview) - Main Form Groups
  overviewCompanyInformationFormGroup = 'overviewCompanyInformationFormGroup',
  serviceDetailsFormGroup = 'serviceDetailsFormGroup',

  // Service Plan - Step 2 (Overview) - Service Details Controls
  serviceType = 'serviceType',
  serviceCategory = 'serviceCategory',
  serviceDescription = 'serviceDescription',
  serviceProvidedTo = 'serviceProvidedTo',
  serviceProvidedToCompanyNames = 'serviceProvidedToCompanyNames',
  totalBusinessDoneLast5Years = 'totalBusinessDoneLast5Years',
  serviceTargetedForLocalization = 'serviceTargetedForLocalization',
  expectedLocalizationDate = 'expectedLocalizationDate',
  serviceLevelLocalizationDate = 'serviceLevelLocalizationDate', // For service level tables in steps 3 & 4
  serviceLocalizationMethodology = 'serviceLocalizationMethodology',

  // Service Plan - Step 3 (Existing Saudi Co.) - Main Form Groups
  existingSaudiFormGroup = 'existingSaudiFormGroup',
  saudiCompanyDetailsFormGroup = 'saudiCompanyDetailsFormGroup',
  collaborationPartnershipFormGroup = 'collaborationPartnershipFormGroup',
  entityLevelFormGroup = 'entityLevelFormGroup',

  // Service Plan - Step 3 (Existing Saudi Co.) - Saudi Company Controls
  saudiCompanyName = 'saudiCompanyName',
  companyType = 'companyType',
  qualificationStatus = 'qualificationStatus',
  products = 'products',
  companyOverview = 'companyOverview',
  keyProjectsExecutedByContractorForSEC = 'keyProjectsExecutedByContractorForSEC',
  companyOverviewKeyProjectDetails = 'companyOverviewKeyProjectDetails',
  companyOverviewOther = 'companyOverviewOther',
  provideAgreementCopy = 'provideAgreementCopy',

  // Service Plan - Step 3 (Existing Saudi Co.) - Collaboration/Partnership Controls
  agreementType = 'agreementType',
  agreementOtherDetails = 'agreementOtherDetails',
  agreementSigningDate = 'agreementSigningDate',
  supervisionOversightEntity = 'supervisionOversightEntity',
  whyChoseThisCompany = 'whyChoseThisCompany',
  summaryOfKeyAgreementClauses = 'summaryOfKeyAgreementClauses',
  agreementCopy = 'agreementCopy',

  // Service Plan - Step 3 & 4 - Entity Level Controls
  expectedAnnualHeadcount = 'expectedAnnualHeadcount',
  firstYear = 'firstYear',
  secondYear = 'secondYear',
  thirdYear = 'thirdYear',
  fourthYear = 'fourthYear',
  fifthYear = 'fifthYear',

  // Service Plan - Step 3 & 4 - Service Level Controls
  serviceLevelFormGroup = 'serviceLevelFormGroup',
  keyRoadblocksPains = 'keyRoadblocksPains',
  mentionSupportRequiredFromSEC = 'mentionSupportRequiredFromSEC',
  keyMeasuresToUpskillSaudis = 'keyMeasuresToUpskillSaudis',

  // Service Plan - Step 4 (Direct Localization) - Main Form Groups
  directLocalizationFormGroup = 'directLocalizationFormGroup',
  localizationStrategyFormGroup = 'localizationStrategyFormGroup',

  // Service Plan - Step 4 (Direct Localization) - Localization Strategy Controls
  localizationApproach = 'localizationApproach',
  localizationApproachOtherDetails = 'localizationApproachOtherDetails',
  location = 'locationType',
  locationOtherDetails = 'locationOtherDetails',
  capexRequired = 'capexRequired',
  willBeAnyProprietaryToolsSystems = 'willBeAnyProprietaryToolsSystems',
  proprietaryToolsSystemsDetails = 'proprietaryToolsSystemsDetails',
}
