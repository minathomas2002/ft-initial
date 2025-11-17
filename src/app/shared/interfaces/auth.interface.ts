import { ERoles } from "../enums/roles.enum";

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  title: string;
  department: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface IAuthData {
  token: string;
  refreshToken: string;
  userId: string;
  userName: string;
  nameAR: string;
  nameEN: string;
  roleIds: string[];
  roleNames: string[];
  roleCodes: ERoles[];
  expiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface IAuthResponse {
  data: IAuthData;
  succeeded: boolean;
  errors: string[];
}

export interface IRefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
}


export interface IPhoneNumberControl {
  dialCode: string;
  nationalNumber: string;  
}
