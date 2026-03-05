import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../api-endpoints';
import { IBaseApiResponse, IChangePasswordRequest, IProfileResponse, IUpdatePersonalInfoRequest, IUpdateProfilePicRequest, IUpdateSignatureRequest } from '../../interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.baseUrl;

  getUserProfile(): Observable<IBaseApiResponse<IProfileResponse>> {
    return this.http.get<IBaseApiResponse<IProfileResponse>>(`${this.baseUrl}/${API_ENDPOINTS.profile.me}`);
  }

  updateSignature(request: IUpdateSignatureRequest): Observable<IBaseApiResponse<boolean>> {
    return this.http.post<IBaseApiResponse<boolean>>(`${this.baseUrl}/${API_ENDPOINTS.profile.signature}`, request);
  }

  updatePersonalInfo(request: IUpdatePersonalInfoRequest): Observable<IBaseApiResponse<boolean>> {
    return this.http.post<IBaseApiResponse<boolean>>(`${this.baseUrl}/${API_ENDPOINTS.profile.updatePersonalInfo}`, request);
  }

  changePassword(request: IChangePasswordRequest): Observable<IBaseApiResponse<void>> {
    return this.http.post<IBaseApiResponse<void>>(
      `${this.baseUrl}/${API_ENDPOINTS.profile.changePassword}`,
      request,
      { withCredentials: true }
    );
  }

  updateProfilePic(request: IUpdateProfilePicRequest): Observable<IBaseApiResponse<boolean>> {
    return this.http.post<IBaseApiResponse<boolean>>(`${this.baseUrl}/${API_ENDPOINTS.profile.updateProfilePic}`, request);
  }
}
