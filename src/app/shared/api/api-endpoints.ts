import { environment } from "../../../environments/environment";

const baseUrl = environment.baseUrl;
const Users = "Users";
const Dashboard = "Dashboard";
const Opportunities = "Opportunities";
const Investors = "Investors";
const AdminOpportunities = "Opportunities/admin";
const SystemEmployees = "SystemEmployees";
const AdminSettings = "AdminSettings";
const Roles = "Roles";
const RoleManagement = "RoleManagement";
const Notifications = "Notifications";

const Auth = "Auth";
const Plans = "Plans";

export const API_ENDPOINTS = {
  baseUrl: baseUrl,
  dashboard: {
    getHelloWorld: `${Dashboard}/hello-world`,
  },
  investors: {
    getInvestors: `${Investors}`,
  },
  users: {
    getAllUsers: `${Users}`,
    createNewUser: `${Users}/create-user`,
  },
  plans: {
    getInvestorDashboardPlans: `${Plans}/get-investor-dashboard-plans`,
    getDvManagerDashboardPlans: `${Plans}/get-dvmanager-dashboard-plans`,
    getActiveEmployeesWithPlans: `${Plans}/active-employees?planId=`,
    assign: `${Plans}/assign`,
    reassign: `${Plans}/reassign`,
    saveAsDraftProductLocalizationPlan: `${Plans}/saveAsDraft-productPlan`,
    saveAsDraftServiceLocalizationPlan: `${Plans}/saveAsDraft-servicePlan`,
    submitProductLocalizationPlan: `${Plans}/submit-productPlan`,
    submitServiceLocalizationPlan: `${Plans}/submit-servicePlan`,
    getProductPlan: `${Plans}/get-productPlan`,
    getServicePlan: `${Plans}/get-servicePlan`,
    getTimelinePlan: `${Plans}/get-timeLine`,
    downloadPlan: `${Plans}/generate-product-plan-pdf?planId=`,
  },
  systemEmployees: {
    getEmployeeDataFromHr: `${SystemEmployees}/hr`,
    getActiveEmployees: `${SystemEmployees}/GetActiveEmployees`,
    getEmployeeDetails: `${SystemEmployees}/GetEmployeeDetails`,
    createSystemEmployee: `${SystemEmployees}/CreateSystemEmployee`,
    getSystemEmployeesList: `${SystemEmployees}/GetSystemEmployeesList`,
    updateSystemEmployee: `${SystemEmployees}/UpdateSystemEmployee`,
    toggleEmployeeStatus: `${SystemEmployees}/ToggleEmployeeStatus`,

    RoleManagement: {
      getRoleManagementList: `${SystemEmployees}/${RoleManagement}/GetList`,
      getCurrentHolders: `${SystemEmployees}/${RoleManagement}/GetCurrentHolders`,
      transferRole: `${SystemEmployees}/${RoleManagement}/Transfer`,
    },
  },
  AdminSettings: {
    getSlaSetting: `${AdminSettings}/get-sla`,
    editSlaSetting: `${AdminSettings}/update-sla`,
    getAutoAssignSetting: `${AdminSettings}/get-auto-assign`,
    editAutoAssignSetting: `${AdminSettings}/update-auto-assign`,
    getHolidaysList: `${AdminSettings}/holidays/list`,
    createHoliday: `${AdminSettings}/holidays/create`,
    updateHoliday: `${AdminSettings}/holidays/update`,
    deleteHoliday: `${AdminSettings}/holidays`,
    getNotificationSetting: `${AdminSettings}/get-notification?channel=`,
    editNotificationSetting: `${AdminSettings}/update-notification`,
    getWorkingDays: `${AdminSettings}/working-days`,
  },
  opportunities: {
    createOpportunity: `${Opportunities}/create-opportunity`,
    draftOpportunity: `${Opportunities}/draft`,
    getOpportunities: `${Opportunities}/get-opportunities`,
    getOpportunityById: `${Opportunities}`,
    getAdminOpportunities: `${AdminOpportunities}`,
    editOpportunity: `${Opportunities}/edit-opportunity`,
    deleteOpportunity: `${Opportunities}`,
    getActiveOpportunityLookUps: `${Opportunities}/GetActiveOpportunityLookUps`,
    changeStatus: `${Opportunities}/change-status`,
    checkApply_Opportunity: `${Opportunities}/checkApply_Opportunity`,
  },
  auth: {
    investorLogin: `${Auth}/investor-login`,
    windowsLogin: `${Auth}/WinLogin`, //production
    fakeWindowsLogin: `${Auth}/login`,
    refreshToken: `${Auth}/refresh-token`,
    register: `${Auth}/register-investor`,
    resetPassword: `${Auth}/reset-password`,
    passwordResetTokenExpiry: `${Auth}/password-reset-token-expiry`,
    forgotPassword: `${Auth}/forget-password`,
    verifyEmail: `${Auth}/verify-email`,
    resendVerifyEmail: `${Auth}/resend-verification-email`,
    getUserProfile: `${Auth}/profile`,
  },
  roles: {
    getRoles: `${Roles}`,
    getSystemRoles: `${Roles}/system`,
    getFilteredRoles: `${Roles}/filtered`,
    getRoleById: `${Roles}`,
    assignRoleToUser: `${Roles}/assign`,
  },
  notifications: {
    getNotificationsPaginated: `${Notifications}/paginated`,
    getUnreadNotifications: `${Notifications}/unread`,
    markNotificationAsRead: `${Notifications}`,
    markAllNotificationsAsRead: `${Notifications}/read-all`,
  },
};
