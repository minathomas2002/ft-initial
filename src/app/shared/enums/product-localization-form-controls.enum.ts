/**
 * Enum for Materials Form Control Names
 * Used to avoid magic strings throughout the form service and components
 */
export enum EMaterialsFormControls {
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
  doYouCurrentlyHaveLocalAgentInKSA = 'doYouCurrentlyHaveLocalAgentInKSA',

  // Local Agent Information Controls
  localAgentName = 'localAgentName',
  contactPersonName = 'contactPersonName',
  emailID = 'emailID',
  contactNumber = 'contactNumber',
  companyHQLocation = 'companyHQLocation',

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
}

