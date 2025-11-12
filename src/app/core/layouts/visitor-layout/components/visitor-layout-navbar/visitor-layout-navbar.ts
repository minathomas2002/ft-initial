import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-visitor-layout-navbar',
  imports: [ButtonModule, RouterLink],
  templateUrl: './visitor-layout-navbar.html',
  styleUrl: './visitor-layout-navbar.scss',
})
export class VisitorLayoutNavbar {

}
