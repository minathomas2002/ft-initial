export interface IProfileResponse {
  photo: string;
  photoURL: string;
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
  userPicBase64: string | null;
  userPicId: string | null;
  employeeId: string | null;
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

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  refreshToken: string;
}

export interface IUpdateProfilePicRequest {
  profilePicBase64: string;
}
