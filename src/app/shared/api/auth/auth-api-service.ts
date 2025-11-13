import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  windowsLogin() {}

  windowsFakeLogin(email: string) {}

  login(email: string, password: string) {}

  register(name: string, email: string, password: string, phone: string) {}

  forgotPassword(email: string) {}

  resetPassword(resetToken: string, password: string) {}

  logout() {}
}
