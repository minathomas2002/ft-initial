import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-auth-side-layout',
  imports: [ImageErrorDirective, TranslatePipe],
  templateUrl: './auth-side-layout.html',
  styleUrl: './auth-side-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSideLayout {

}
