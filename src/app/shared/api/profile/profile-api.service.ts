import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.baseUrl;

  getUserProfile() {
    return this.http.get<any>(`${this.baseUrl}/${API_ENDPOINTS.profile.me}`);
  }
}
