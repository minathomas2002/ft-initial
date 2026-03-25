import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSideLayout } from './components/auth-side-layout/auth-side-layout';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';
import { LanguageSwitcherComponent } from "src/app/shared/components/language-switcher";
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterOutlet,
    AuthSideLayout,
    ImageErrorDirective,
    LanguageSwitcherComponent,
    TranslatePipe
  ],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {

}
