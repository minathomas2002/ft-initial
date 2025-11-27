import { environment } from "../../../environments/environment";

const baseUrl = environment.baseUrl;
const Users = "Users";
const Dashboard = "Dashboard";
const Opportunities = "Opportunities";
const Investors = "Investors";
const AdminOpportunities = "Opportunities/admin";
const SystemEmployees = "SystemEmployees";

const Auth = "Auth";

export const API_ENDPOINTS = {
  baseUrl: baseUrl,
  dashboard: {
    getHelloWorld: `${Dashboard}/hello-world`,
  },
  users: {
    getUserTitles: `${Users}/user-titles`,
    getEmployees: `${SystemEmployees}/getSystemEmployeesList`,
    getInvestors: `${Investors}`,
  },
  opportunities: {
    createOpportunity: `${Opportunities}/create-opportunity`,
    draftOpportunity: `${Opportunities}/draft`,
    getOpportunities: `${Opportunities}/get-opportunities`,
    getOpportunityById: `${Opportunities}`,
    getAdminOpportunities: `${AdminOpportunities}`,
    editOpportunity: `${Opportunities}/edit-opportunity`,
  },
  auth: {
    investorLogin: `${Auth}/investor-login`,
    windowsLogin: `${Auth}/login`,//TODO: to be updated
    fakeWindowsLogin: `${Auth}/login`,
    refreshToken: `${Auth}/refresh-token`,
    register: `${Auth}/register-investor`,
    resetPassword: `${Auth}/reset-password`,
    forgotPassword: `${Auth}/forget-password`,
    verifyEmail: `${Auth}/verify-email`,
    resendVerifyEmail: `${Auth}/resend-verification-email`
  },
};
