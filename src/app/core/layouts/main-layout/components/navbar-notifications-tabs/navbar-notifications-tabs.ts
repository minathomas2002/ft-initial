import { Component, inject, input, output } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { INotification } from 'src/app/core/layouts/main-layout/models/notifications.interface';
import { TimeAgoPipe } from '../../../../../shared/pipes/time-ago.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-notifications-tabs',
  imports: [TimeAgoPipe, ProgressSpinnerModule],
  templateUrl: './navbar-notifications-tabs.html',
  styleUrl: './navbar-notifications-tabs.scss',
})
export class NavbarNotificationsTabs {
  private readonly router = inject(Router);

  notifications = input<INotification[]>();
  loading = input<boolean>();
  notificationClick = output<void>();

  onNotificationClick() {
    this.notificationClick.emit();
    this.router.navigate(['dashboard', 'dv-manager'], { queryParams: { status: 'unassigned' } });
  }
}
