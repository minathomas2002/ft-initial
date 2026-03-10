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
  ViewPlans = 7,
}

export enum EOpportunityQuantity {
  KM = 1,
  Panels = 2,
  CB = 3,
  Discs = 4,
  KTons = 5,
  Unit = 6
}

export enum EOpportunityLocalizationTablesValidation {
  DesignEngineering = 'designEngineeringRequired',
  Sourcing = 'sourcingRequired',
  Manufacturing = 'manufacturingRequired',
  AssemblyTesting = 'assemblyTestingRequired',
  AfterSales = 'afterSalesRequired',
}
