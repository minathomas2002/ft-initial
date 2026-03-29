import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';
import { TranslatePipe } from 'src/app/shared/pipes';
import { LanguageSwitcherComponent } from "src/app/shared/components/language-switcher";

@Component({
  selector: 'app-visitor-layout-navbar',
  imports: [ButtonModule, RouterLink, ImageErrorDirective, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './visitor-layout-navbar.html',
  styleUrl: './visitor-layout-navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitorLayoutNavbar {

}
