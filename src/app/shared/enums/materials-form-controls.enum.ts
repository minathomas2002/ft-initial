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
}

