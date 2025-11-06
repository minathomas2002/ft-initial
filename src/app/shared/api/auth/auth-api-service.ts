import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  login(email: string, password: string) {}

  register(name: string, email: string, password: string) {}

  forgotPassword(email: string) {}

  resetPassword(email: string, password: string) {}

  logout() {}
}
