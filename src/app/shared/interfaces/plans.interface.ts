import { EOpportunityType, EStatusPlanTimeLine, ETargetedCustomer } from "../enums"
import { EActionPlanTimeLine } from "../enums/action-plan-timeline.enum"
import { EEmployeePlanStatus, EInvestorPlanStatus } from "./dashboard-plans.interface"

export interface IProductLocalizationPlanRequest {
  productPlan: ProductPlan
  signature: Signature
}

export interface ProductPlan {
  id: string;
  isDraft?: boolean;
  status?: EEmployeePlanStatus;
  overviewCompanyInfo: OverviewCompanyInfo
  productPlantOverview: ProductPlantOverview
  valueChainStep: ValueChainStep
  saudization: Saudization
}

export interface OverviewCompanyInfo {
  basicInfo: BasicInfo
  companyInfo: CompanyInfo
  locationInfo: LocationInfo
}

export interface BasicInfo {
  planTitle: string
  opportunityType: number
  opportunityTitle: string
  opportunityId: string
  createdDate: string
  planCode: number
}

export interface CompanyInfo {
  companyName: string
  ceoName: string
  ceoEmail: string
}

export interface LocationInfo {
  globalHQLocation: string
  vendorIdWithSEC: string
  hasLocalAgent: boolean
  localAgentName: string
  contactPersonName: string
  localAgentEmail: string
  localAgentContactNumber: string
  companyHQLocation: string
}

export interface ProductPlantOverview {
  overview: Overview
  expectedCapex: ExpectedCapex
  targetCustomers: TargetCustomers
  manufacturingExperience: ManufacturingExperience
}

export interface Overview {
  productName: string
  productSpecifications: string
  targetedAnnualPlantCapacity: string
  timeRequiredToSetupFactory: string
}

export interface ExpectedCapex {
  landPercent: number
  buildingPercent: number
  machineryPercent: number
  othersPercent: number
  othersDescription: string
}

export interface TargetCustomers {
  targetSEC: ETargetedCustomer[],
  targetLocalSuppliers: boolean
  targetedLocalSupplierNames: string
  productsUtilizingTargetProduct: string
}

export interface ManufacturingExperience {
  experienceRange: string
  provideToSEC: boolean
  qualifiedPlantLocation_SEC: string
  approvedVendorId_SEC: string
  yearsExperience_SEC: number
  totalQuantitiesToSEC: number
  provideToLocalSuppliers: boolean
  localSupplierNames: string
  qualifiedPlantLocation_LocalSupplier: string
  yearsExperience_LocalSupplier: number
  totalQuantitiesToLocalSuppliers: number
}

export interface ValueChainStep {
  valueChainRows: ValueChainRow[]
  valueChainSummary: string
}

export interface ValueChainRow {
  id: string
  sectionType: number
  expenseHeader: string
  inHouseOrProcured: number
  costPercent: number
  year1: number
  year2: number
  year3: number
  year4: number
  year5: number
  year6: number
  year7: number
}

export interface Saudization {
  saudizationRows: SaudizationRow[]
  attachments: Attachment[]
}

export interface SaudizationRow {
  id: string
  year1: number
  year2: number
  year3: number
  year4: number
  year5: number
  year6: number
  year7: number
  saudizationType: number
}

export interface Attachment {
  id: string
  fileName: string
  fileExtension: string
  fileUrl: string
  file: string
}

export interface Signature {
  id: string
  signatureValue: string
  contactInfo: ContactInfo
}

export interface ContactInfo {
  name: string
  jobTitle: string
  contactNumber: string
  emailId: string
}

export interface IProductPlanResponse {
  productPlan: ProductPlan
  signature: Signature
}

export interface ICommentFields {
  name: string;
  id: string;

}
export interface ITimelineComment {
  pageTitle: string;
  text: string;
  fields: ICommentFields[];

}

export interface ITimeLineResponse {
  actionType: EActionPlanTimeLine;
  status: EStatusPlanTimeLine;
  actionByNameEn: string;
  actionByNameAr: string;
  actorRole: number;
  targetUserNameEn: string;
  targetUserNameAr: string;
  timestamp: string;
  profilePicURL: string;
  planType: EOpportunityType;
  daysAfterPreviousAction: number;
  comments: ITimelineComment[];
}

export interface IPlanStatus {
  getStatusLabel(status: number): string;
  getStatusBadgeClass(status: number): string;
}

