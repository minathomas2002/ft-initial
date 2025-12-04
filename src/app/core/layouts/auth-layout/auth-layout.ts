import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSideLayout } from './components/auth-side-layout/auth-side-layout';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';
import { TrimOnBlurDirective } from 'src/app/shared/directives/trim-on-blur.directive';

@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterOutlet,
    AuthSideLayout,
    ImageErrorDirective,
    TrimOnBlurDirective,
  ],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {

}
