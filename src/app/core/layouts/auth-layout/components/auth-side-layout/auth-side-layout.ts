import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';

@Component({
  selector: 'app-auth-side-layout',
  imports: [ImageErrorDirective],
  templateUrl: './auth-side-layout.html',
  styleUrl: './auth-side-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSideLayout {

}
