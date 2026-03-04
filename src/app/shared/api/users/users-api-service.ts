import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints';
import { IBaseApiResponse } from '../../interfaces';
import { SupportedLanguage } from '../../services/i18n/i18n.service';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.baseUrl;

  changeLanguage(language: SupportedLanguage): Observable<IBaseApiResponse<void>> {
    return this.http.post<IBaseApiResponse<void>>(
      `${this.baseUrl}/${API_ENDPOINTS.users.changeLanguage}`,
      { language }
    );
  }
}
