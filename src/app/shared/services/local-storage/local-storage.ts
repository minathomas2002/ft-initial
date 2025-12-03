import { Injectable } from '@angular/core';
import { IAuthData, IBaseApiResponse, IUserProfile } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  
  private readonly AUTH_STORAGE_KEY = 'auth_data';
  private readonly USER_PROFILE_STORAGE_KEY = 'user_profile';
  
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

  saveUserProfileToStorage(userProfile: IUserProfile): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    }
  }

  getUserProfile(): IUserProfile | null {
    var stored = localStorage.getItem(this.USER_PROFILE_STORAGE_KEY);
    return stored ? JSON.parse(stored) as IUserProfile : null;
  }

  cleanUserProfile() {
    localStorage.removeItem(this.USER_PROFILE_STORAGE_KEY);
  }

  cleanAll() {
    this.cleanAuthData();
    this.cleanUserProfile();
  }
}
