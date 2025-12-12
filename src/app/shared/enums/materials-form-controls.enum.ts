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
}

