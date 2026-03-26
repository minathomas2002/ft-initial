import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguageSwitcherComponent } from 'src/app/shared/components/language-switcher';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-auth-side-layout',
  imports: [TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './auth-side-layout.html',
  styleUrl: './auth-side-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSideLayout {

}
