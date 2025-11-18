import { Injectable } from '@angular/core';
import { IAuthData, IBaseApiResponse } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  
  private readonly AUTH_STORAGE_KEY = 'auth_data';
  
  saveAuthDataToStorage(authResponse: IBaseApiResponse<IAuthData>): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(authResponse.body));
    }
  }

  getAuthData(): IAuthData | null {
    var stored = localStorage.getItem(this.AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) as IAuthData : null;
  }

  cleanAuthData() {
    localStorage.removeItem(this.AUTH_STORAGE_KEY);
  }
}
