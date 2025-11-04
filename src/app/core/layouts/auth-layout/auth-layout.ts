import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSideLayout } from './components/auth-side-layout/auth-side-layout';

@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterOutlet,
    AuthSideLayout
  ],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {

}
