import { Component } from '@angular/core';
import { VisitorLayoutNavbar } from "./components/visitor-layout-navbar/visitor-layout-navbar";
import { RouterOutlet } from '@angular/router';
import { LayoutFooterComponent } from '../../../shared/components/layout-components/layout-footer/layout-footer.component';
import { TrimOnBlurDirective } from 'src/app/shared/directives/trim-on-blur.directive';

@Component({
  selector: 'app-visitor-layout',
  imports: [VisitorLayoutNavbar, RouterOutlet, LayoutFooterComponent, TrimOnBlurDirective],
  templateUrl: './visitor-layout.html',
  styleUrl: './visitor-layout.scss',
})
export class VisitorLayout {

}
