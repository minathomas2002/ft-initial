import { environment } from "../../../environments/environment";

const baseUrl = environment.baseUrl;
const Users = "Users";
const Dashboard = "Dashboard";
const Opportunities = "Opportunities";
const AdminOpportunities = "Opportunities/admin";

const Auth = "Auth";

export const API_ENDPOINTS = {
  baseUrl: baseUrl,
  dashboard: {
    getHelloWorld: `${Dashboard}/hello-world`,
  },
  users: {
    getUserTitles: `${Users}/user-titles`,
  },
  opportunities: {
    createOpportunity: `${Opportunities}/create-opportunity`,
    draftOpportunity: `${Opportunities}/draft`,
    getOpportunities: `${Opportunities}/get-opportunities`,
    getOpportunityById: `${Opportunities}`,
    getAdminOpportunities: `${AdminOpportunities}/admin`,
    editOpportunity: `${Opportunities}/edit-opportunity`,
  },
  auth: {
    investorLogin: `${Auth}/investor-login`,
    windowsLogin: `${Auth}/login`,
    fakeWindowsLogin: `${Auth}/login`,
    refreshToken: `${Auth}/refresh-token`,
    register: `${Auth}/register-investor`,
    resetPassword: `${Auth}/reset-password`,
    forgotPassword: `${Auth}/forgot-password`
  },
};
