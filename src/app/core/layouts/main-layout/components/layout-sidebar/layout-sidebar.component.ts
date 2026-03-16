import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { SidebarContentComponent } from '../sidebar-content/sidebar-content.component';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

@Component({
  selector: 'app-layout-sidebar',
  imports: [NgClass, ButtonModule, RouterModule, SidebarContentComponent],
  templateUrl: './layout-sidebar.component.html',
  styleUrl: './layout-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutSidebarComponent {
  private readonly authStore = inject(AuthStore);
  private readonly i18nService = inject(I18nService);

  isSidebarExpanded = input<boolean>(true);
  toggleSidebar = output<void>();

  isImpersonating = computed(() => this.authStore.isImpersonating());
  isRtl = computed(() => this.i18nService.currentLanguage() === 'ar');
  fixedSidebarPositionClass = computed(() =>
    this.isRtl() ? 'right-0' : 'left-0',
  );
  sidebarWidthClass = computed(() =>
    this.isSidebarExpanded() ? 'w-[280px] min-w-[280px]' : 'w-[80px] min-w-[80px]',
  );
}
