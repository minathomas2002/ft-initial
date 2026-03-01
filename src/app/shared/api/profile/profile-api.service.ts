import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../api-endpoints';
import { IBaseApiResponse, IProfileResponse } from '../../interfaces';
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

  updateSignature(signature: string | null): Observable<IBaseApiResponse<boolean>> {
    return this.http.post<IBaseApiResponse<boolean>>(`${this.baseUrl}/${API_ENDPOINTS.profile.signature}`, { signatureBase64: signature });
  }
}
