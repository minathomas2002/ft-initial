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
    getOpportunities: `${Opportunities}/get-opportunities`,
    getAdminOpportunities: `${AdminOpportunities}`
  },
  auth: {
    investorLogin: `${Auth}/investor-login`,
    windowsLogin: `${Auth}/login`,
    fakeWindowsLogin: `${Auth}/login`,
    refreshToken: `${Auth}/refresh-token`,
    register: `${Auth}/register-investor`,
    resetPassword: `${Auth}/reset-password`,
    forgotPassword: `${Auth}/forgot-password`,
    verifyEmail: `${Auth}/verify-email`
  },
};
