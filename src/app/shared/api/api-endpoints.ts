import { environment } from "../../../environments/environment";

const baseUrl = environment.baseUrl;
const Users = "Users";
const Dashboard = "Dashboard";
const Opportunities = "Opportunities";

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
    getOpportunities: `${Opportunities}`,
  },
  auth: {
    login: `${Auth}/login`,
    windowsLogin: `${Auth}/login`,
    fakeWindowsLogin: `${Auth}/login`,
    refreshToken: `${Auth}/refresh-token`,
  },
};
