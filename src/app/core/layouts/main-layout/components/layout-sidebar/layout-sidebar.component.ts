import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ERoutes } from '../../../../../shared/enums';
import { RouterModule } from '@angular/router';
import { SidebarContentComponent } from '../sidebar-content/sidebar-content.component';
@Component({
  selector: 'app-layout-sidebar',
  imports: [ButtonModule, RouterModule, SidebarContentComponent],
  templateUrl: './layout-sidebar.component.html',
  styleUrl: './layout-sidebar.component.scss',
})
export class LayoutSidebarComponent { }
