import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';

@Component({
  selector: 'app-visitor-layout-navbar',
  imports: [ButtonModule, RouterLink, ImageErrorDirective],
  templateUrl: './visitor-layout-navbar.html',
  styleUrl: './visitor-layout-navbar.scss',
})
export class VisitorLayoutNavbar {

}
