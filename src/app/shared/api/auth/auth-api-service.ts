import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints';
import { IAuthResponse, IRefreshTokenRequest, IRegisterRequest, IResetPasswordRequest } from '../../interfaces';
import { IApiResponse } from '../../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.baseUrl;

  windowsLogin(): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.baseUrl}/${API_ENDPOINTS.auth.windowsLogin}`, {});
  }

  fakeWindowsLogin(userName: string): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.baseUrl}/${API_ENDPOINTS.auth.windowsLogin}`, {
      userName,
    });
  }

  login(email: string, password: string): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.baseUrl}/${API_ENDPOINTS.auth.investorLogin}`, {
      email,
      password,
    });
  }

  refreshToken(request: IRefreshTokenRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(
      `${this.baseUrl}/${API_ENDPOINTS.auth.refreshToken}`,
      request
    );
  }

  register(registerRequest: IRegisterRequest) {
    return this.http.post<any>(`${this.baseUrl}/${API_ENDPOINTS.auth.register}`, registerRequest);
  }

  forgotPassword(email: string): Observable<IApiResponse<void>> {
    return this.http.post<IApiResponse<void>>(`${this.baseUrl}/${API_ENDPOINTS.auth.forgotPassword}`, {
      email,
    });
  }

  resetPassword(request: IResetPasswordRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.baseUrl}/${API_ENDPOINTS.auth.resetPassword}`, request);
  }

  logout() {}
}
