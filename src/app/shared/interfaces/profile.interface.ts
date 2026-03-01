export interface IProfileResponse {
  photo: string;
  nameEn: string;
  nameAr: string;
  email: string;
  phoneNumber: string;
  otherPhoneNumber: string;
  benaId: string;
  signature: string;
  userSignatureId: string;
  secRegisteredId: string;
  countryCode: string;
  otherPhoneCountryCode: string;
}

export interface IUpdateSignatureRequest {
  userSignatureId: string;
  signatureBase64: string;
}

export interface IUpdatePersonalInfoRequest {
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  otherPhoneNumber: string;
  secRegisteredId: string;
  otherPhoneCountryCode: string;
}