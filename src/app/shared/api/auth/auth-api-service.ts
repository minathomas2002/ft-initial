import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints';
import { IAuthData, IBaseApiResponse, IRefreshTokenRequest, IRegisterRequest, IResetPasswordRequest } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.baseUrl;

  windowsLogin(): Observable<IBaseApiResponse<IAuthData>> {
    return this.http.post<IBaseApiResponse<IAuthData>>(`${this.baseUrl}/${API_ENDPOINTS.auth.windowsLogin}`, {});
  }

  fakeWindowsLogin(userName: string): Observable<IBaseApiResponse<IAuthData>> {
    return this.http.post<IBaseApiResponse<IAuthData>>(`${this.baseUrl}/${API_ENDPOINTS.auth.windowsLogin}`, {
      userName,
    });
  }

  login(email: string, password: string): Observable<IBaseApiResponse<IAuthData>> {
    return this.http.post<IBaseApiResponse<IAuthData>>(`${this.baseUrl}/${API_ENDPOINTS.auth.investorLogin}`, {
      email,
      password,
    });
  }

  refreshToken(request: IRefreshTokenRequest): Observable<IBaseApiResponse<IAuthData>> {
    return this.http.post<IBaseApiResponse<IAuthData>>(
      `${this.baseUrl}/${API_ENDPOINTS.auth.refreshToken}`,
      request
    );
  }

  register(registerRequest: IRegisterRequest) {
    return this.http.post<any>(`${this.baseUrl}/${API_ENDPOINTS.auth.register}`, registerRequest);
  }

  forgotPassword(email: string): Observable<IBaseApiResponse<void>> {
    return this.http.post<IBaseApiResponse<void>>(`${this.baseUrl}/${API_ENDPOINTS.auth.forgotPassword}`, {
      email,
    });
  }

  resetPassword(request: IResetPasswordRequest): Observable<IBaseApiResponse<any>> {
    return this.http.post<IBaseApiResponse<any>>(`${this.baseUrl}/${API_ENDPOINTS.auth.resetPassword}`, request);
  }

  verifyEmail(token: string): Observable<IBaseApiResponse<any>> {
    return this.http.get<IBaseApiResponse<any>>(`${this.baseUrl}/${API_ENDPOINTS.auth.verifyEmail}?token=${token}`);
  }

  logout() {}
}
