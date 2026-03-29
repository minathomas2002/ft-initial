import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VisitorLayoutNavbar } from "./components/visitor-layout-navbar/visitor-layout-navbar";
import { RouterOutlet } from '@angular/router';
import { LayoutFooterComponent } from "../main-layout/components/layout-footer/layout-footer.component";
@Component({
  selector: 'app-visitor-layout',
  imports: [VisitorLayoutNavbar, RouterOutlet, LayoutFooterComponent],
  templateUrl: './visitor-layout.html',
  styleUrl: './visitor-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitorLayout {

}
