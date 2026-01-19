import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Popover, PopoverModule } from 'primeng/popover';
import { EOpportunityType, ERoutes } from '../../../../../shared/enums';
import { NotificationHubService } from '../../../../../shared/services/signalr/notification-hub.service';
import { Subject, takeUntil } from 'rxjs';
import { NavbarNotificationsTabs } from '../navbar-notifications-tabs/navbar-notifications-tabs';
import { INotification, INotificationItem } from 'src/app/core/layouts/main-layout/models/notifications.interface';
import { NotificationsStore } from 'src/app/shared/stores/notifications/notifications.store';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ServiceLocalizationPlanWizard } from "src/app/shared/components/plans/service-localication/service-localization-plan-wizard/service-localization-plan-wizard";
import { ProductLocalizationPlanWizard } from "src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard";
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-navbar-notifications',
  imports: [
    ButtonModule,
    OverlayBadgeModule,
    BadgeModule,
    MenuModule,
    PopoverModule,
    NavbarNotificationsTabs,
    ServiceLocalizationPlanWizard,
    ProductLocalizationPlanWizard
  ],
  templateUrl: './navbar-notifications.component.html',
  styleUrl: './navbar-notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarNotificationsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly notificationsModal = viewChild<Popover>('notificationsModal');

  private isPopoverOpen = false;

  private readonly notificationHubService = inject(NotificationHubService);
  private readonly notificationStore = inject(NotificationsStore);
  private readonly router = inject(Router);
  private readonly planStore = inject(PlanStore);
  private readonly toastService = inject(ToasterService);


  private readonly destroy$ = new Subject<void>();
  readonly notifications = this.notificationStore.notifications;
  readonly unreadCount = this.notificationStore.unreadCount;
  readonly isLoading = this.notificationStore.loading;
  readonly totalCount = this.notificationStore.totalCount;
  readonly currentPage = this.notificationStore.currentPage;
  readonly pageSize = this.notificationStore.pageSize;

  isShowPreviousButtonClicked = signal(false);
  productLocalizationPlanWizardVisibility = signal(false);
  serviceLocalizationPlanWizardVisibility = signal(false);

  get ERoutes() {
    return ERoutes;
  }

  ngOnInit(): void {
    // Start SignalR connection
    this.notificationHubService.startConnection().catch((error) => {
      console.error('Failed to start SignalR connection:', error);
    });

    // Subscribe to ReceiveNotification event
    this.notificationHubService
      .onReceiveNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        console.log('Notification received in component:', notification);
        // Add the new notification to the store
        this.notificationStore.addNotification(notification as INotification);
      });

    this.loadUnreadNotifications();
  }

  loadNotifications() {
    this.notificationStore.getNotifications().pipe(takeUntil(this.destroy$)).subscribe();
  }

  loadUnreadNotifications() {
    this.notificationStore.getUnreadNotification().pipe(takeUntil(this.destroy$)).subscribe();
  }

  /**
   * Load older notifications once when user clicks the 'Previous Notifications' button.
   * After this the button is hidden and infinite scroll will load more pages.
   */
  loadPreviousNotifications(): void {
    const nextPage = this.currentPage() + 1;
    this.notificationStore.getMoreNotifications(nextPage, 5).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isShowPreviousButtonClicked.set(true)
      },
      error: () => {
        this.isShowPreviousButtonClicked.set(true)
      }
    });
  }

  onScroll(event: Event): void {
    // Only enable infinite scroll after previous button was clicked
    if (!this.isShowPreviousButtonClicked()) return;
    const el = event.target as HTMLElement;
    const threshold = 120;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      const loaded = this.notifications()?.length ?? 0;
      const total = this.totalCount() ?? 0;
      if (loaded < total && !this.isLoading()) {
        const nextPage = this.currentPage() + 1;
        this.notificationStore.getMoreNotifications(nextPage, this.pageSize()).pipe(takeUntil(this.destroy$)).subscribe();
      }
    }
  }

  markAllAsRead() {
    this.notificationStore.markAllAsRead();
  }

  onNotificationClick(notification: INotificationItem) {
    if (!notification || !notification.id) {
      console.error('Invalid notification or missing ID:', notification);
      return;
    }

    // Mark notification as read (API call happens in the store)
    this.notificationStore.setNotificationAsRead(notification.id);
    // Navigate to the notification route
    if (notification.route && notification.route.length > 0) {
      this.router.navigate(notification.route, { queryParams: notification.params });
      this.notificationsModal()?.hide()
    }

  }

  toggleNotificationTab(event: PointerEvent) {
    this.notificationsModal()?.toggle(event)
    this.isShowPreviousButtonClicked.set(false)
  }

  onPopoverShow(): void {
    this.isPopoverOpen = true;
  }

  onPopoverHide(): void {
    this.isPopoverOpen = false;
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    if (!this.isPopoverOpen) return;
    this.repositionPopover();
  }

  private repositionPopover(): void {
    const popover = this.notificationsModal();
    if (!popover) return;

    // PrimeNG API differs across versions; try the common reposition methods.
    const anyPopover = popover as unknown as {
      align?: () => void;
      updatePosition?: () => void;
      hide?: () => void;
    };

    if (typeof anyPopover.align === 'function') {
      anyPopover.align();
      return;
    }

    if (typeof anyPopover.updatePosition === 'function') {
      anyPopover.updatePosition();
      return;
    }

    // Fallback: at least avoid a "stuck" overlay.
    anyPopover.hide?.();
  }

  ngAfterViewInit(): void {
    // this.notificationsActionsService.setPopoverRef(this.popoverRef);
  }

  ngOnDestroy(): void {
    this.isPopoverOpen = false;
    this.destroy$.next();
    this.destroy$.complete();
    // Note: We're not stopping the connection here because it might be used by other components
    // If you want to stop it when this component is destroyed, uncomment the line below:
    // this.notificationHubService.stopConnection();
  }
}
