export enum EOpportunityStatus {
  DRAFT = 1,
  PUBLISHED = 2,
}

export enum EOpportunityType {
  SERVICES = 1,
  PRODUCT = 2,
}

export enum EOpportunityState {
  ACTIVE = 1,
  INACTIVE = 2,
}

export enum EOpportunityAction {
  Edit = 1,
  Delete = 2,
  MoveToDraft = 3,
  Publish = 4,
  Apply = 5,
  SystemReminder = 6,
}
