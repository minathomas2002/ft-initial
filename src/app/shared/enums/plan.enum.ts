export enum ETargetedCustomer {
  SEC = 1,
  SEC_APPROVED_LOCAL_SUPPLIERS = 2,
}

export enum EProductManufacturingExperience {
  YES = 1,
  NO = 2,
}

export enum EExperienceRange {
  Years_5 = 1,
  Years_5_10 = 2,
  Years_10 = 3,
}

export enum EInHouseProcuredType {
  InHouse = 1,
  Procured = 2,
}

export enum ELocalizationStatusType {
  Yes = 1,
  No = 2,
  Partial = 3,
}

export enum EServiceType {
  Technical = 1,
  NonTechnical = 2,
}

export enum EServiceProvidedTo {
  Contractors = 1,
  Manufacturers = 2,
  Others = 3,
}

export enum EServiceCategory {
  CategoryA = 1,
  CategoryB = 2,
}

export enum EServiceQualificationStatus {
  Qualified = 1,
  UnderPreQualification = 2,
  NotQualified = 3,
}

export enum ELocalizationMethodology {
  Collaboration = 1,
  Direct = 2,
}

export enum EYesNo {
  Yes = 1,
  No = 2,
}

export enum ELocalizationApproach {
  EstablishSaudiEntity = 1,
  EstablishLocalBranch = 2,
  Other = 3,
}

export enum ELocation {
  SaudiEntity = 1,
  Branch = 2,
  Other = 3,
}

export enum EPlanAction {
  EditPlan = 1,
  ViewDetails = 2,
  DownloadPDF = 3,
  Submitted = 4,
  Assigned = 5,
  Reassigned = 6,
  CommentSubmitted = 7,
  Resubmitted = 8,
  Approved = 9,
  Rejected = 10,
  EmployeeApproved = 11,
  DVApproved = 12,
  DeptApproved = 13,
  DVRejected = 14,
  DeptRejected = 15,
  DVRejectionAcknowledged = 16,
  ReturnedForMoreInfo = 17,
  ViewTimeLine = 18,
  AutoAssign = 19,
}
