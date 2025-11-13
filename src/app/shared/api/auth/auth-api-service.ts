import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints';
import { IAuthResponse, IRefreshTokenRequest } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.baseUrl;

  windowsLogin(): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(
      `${this.baseUrl}/${API_ENDPOINTS.auth.login}`, {}      
    );
  }

  fakeWindowsLogin(userName: string): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(
      `${this.baseUrl}/${API_ENDPOINTS.auth.login}`,
      { userName }
    );
  }

  login(email: string, password: string): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(
      `${this.baseUrl}/${API_ENDPOINTS.auth.login}`,
      { email, password }
    );
  }

  refreshToken(request: IRefreshTokenRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(
      `${this.baseUrl}/${API_ENDPOINTS.auth.refreshToken}`,
      request
    );
  }

  register(name: string, email: string, password: string, phone: string) { }

  forgotPassword(email: string) { }

  resetPassword(resetToken: string, password: string) { }

  logout() { }
}
