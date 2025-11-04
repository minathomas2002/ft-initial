import { environment } from "../../../environments/environment";

const baseUrl = environment.baseUrl;


export const API_ENDPOINTS = {
	baseUrl: baseUrl,
	dashboard: {
		getHelloWorld: `${baseUrl}/api/hello-world`,
	},
};
