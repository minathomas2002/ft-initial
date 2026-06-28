import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { BaseCard } from 'src/app/shared/components/base-components/base-card/base-card';
import { OpportunityDetailsCardInfoItem } from '../../components/opportunity-details-card-info-item/opportunity-details-card-info-item';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { getOpportunityTypeConfig } from 'src/app/shared/utils/opportunities.utils';
import { PermissionService } from 'src/app/shared/services/permission/permission-service';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { EOpportunityAction, EOpportunityQuantity, EOpportunityStatus, EOpportunityType, ERoutes, EViewMode } from 'src/app/shared/enums';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { OpportunityActionsService } from '../../services/opportunity-actions/opportunity-actions-service';
import { Subject, take, takeUntil } from 'rxjs';
import { OpportunityActionMenuComponent } from 'src/app/shared/components/opportunities/opportunity-action-menu/opportunity-action-menu.component';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { CreateEditOpportunityDialog } from '../../components/create-edit-opportunity-dialog/create-edit-opportunity-dialog';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { ServiceLocalizationPlanWizard } from 'src/app/shared/components/plans/service-localication/service-localization-plan-wizard/service-localization-plan-wizard';
import { opportunityImagePlaceholder } from './opportunity-image-placeholder';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { I18nService } from 'src/app/shared/services/i18n';
import { opportunityUnitsMapper } from '../../classes/opportunity-units-mapper';
import { OpportunityAuditDetails } from "./opportunity-audit-details/opportunity-audit-details";
import { TColors } from 'src/app/shared/interfaces';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-opportunity-details',
  imports: [
    BaseCard,
    OpportunityDetailsCardInfoItem,
    Tooltip,
    BaseTagComponent,
    TranslatePipe,
    ButtonModule,
    CardsSkeleton,
    OpportunityActionMenuComponent,
    GeneralConfirmationDialogComponent,
    CreateEditOpportunityDialog,
    ImageErrorDirective,
    ProductLocalizationPlanWizard,
    ServiceLocalizationPlanWizard,
    PlanTermsAndConditionsDialog,
    OpportunityAuditDetails
  ],
  templateUrl: './opportunity-details.html',
  styleUrl: './opportunity-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityDetails implements OnInit, OnDestroy {
  private readonly lri = '\u2066';
  private readonly pdi = '\u2069';

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  opportunitiesStore = inject(OpportunitiesStore);
  permissionService = inject(PermissionService);
  planStore = inject(PlanStore);
  authStore = inject(AuthStore);
  toast = inject(ToasterService);
  getOpportunityTypeConfig = getOpportunityTypeConfig;
  opportunityActionsService = inject(OpportunityActionsService);
  isAnonymous = computed(() => !this.authStore.authResponse()?.token);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  createEditOpportunityDialogVisible = signal<boolean>(false);
  deleteConfirmDialogVisible = signal<boolean>(false);
  moveToDraftConfirmDialogVisible = signal<boolean>(false);
  publishConfirmDialogVisible = signal<boolean>(false);
  opportunityId = signal<string | null>(null);
  productLocalizationPlanWizardVisibility = signal<boolean>(false);
  serviceLocalizationPlanWizardVisibility = signal<boolean>(false);
  planTermsAndConditionsDialogVisibility = signal<boolean>(false);
  i18nService = inject(I18nService);
  private readonly opportunityUnitMapper = new opportunityUnitsMapper(this.i18nService);
  get EOpportunityAction() {
    return EOpportunityAction;
  }
  get EOpportunityStatus() {
    return EOpportunityStatus;
  }
  canApplyOnOpportunity = computed(() => this.permissionService.canApplyOnOpportunityCard());
  direction = computed(() => this.i18nService.currentLanguage() === 'ar' ? 'rtl' : 'ltr');

  private readonly destroy$ = new Subject<void>()

  today = new Date();

  forecastedDemand = computed(() => {
    const startYear = this.today.getFullYear();
    const endYear = this.today.getFullYear() + 5;
    return this.i18nService.translate('opportunity.form.forecastedDemandWithYears', {
      startYear: String(startYear),
      endYear: String(endYear),
    });
  });

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const id = res.get('id');

          if (id) {
            this.opportunityId.set(id);
            this.getOpportunityDetails();
          }
        }
      })
  }

  getOpportunityDetails() {
    this.opportunitiesStore.getOpportunityDetails(this.opportunityId()!).pipe(take(1)).subscribe();
  }

  onBack() {
    if (this.isAnonymous()) {
      this.router.navigate([environment.baseHref, ERoutes.anonymous, ERoutes.opportunities]);
    } else if (this.permissionService.canAccessOnOpportunityAdmin()) {
      this.router.navigate([environment.baseHref, ERoutes.opportunities, ERoutes.admin]);
    } else {
      this.router.navigate([environment.baseHref, ERoutes.opportunities]);
    }
  }

  onApply() {
    if (this.authStore.isAuthenticated()) {
      this.opportunitiesStore.checkApplyOpportunity(this.opportunityId()!).subscribe((res) => {
        if (res.body) {
          this.applyOpportunity(
            this.opportunityId()!,
            this.opportunitiesStore.details()?.title ?? ''
          );
        } else {
          this.toast.warn(
            this.i18nService.translate('opportunity.warning.inProgressPlan')
          );
        }
      });
    } else {
      this.router.navigate([environment.baseHref, ERoutes.auth, ERoutes.login]);
    }
  }

  onAction(action: EOpportunityAction) {
    // Handle actions (Edit, Delete, MoveToDraft, Publish)
    switch (action) {
      case EOpportunityAction.Edit:
        // Open edit dialog
        this.adminOpportunitiesStore.setViewMode(EViewMode.Edit);
        this.adminOpportunitiesStore.setSelectedOpportunityId(this.opportunityId()!);
        this.createEditOpportunityDialogVisible.set(true);
        break;
      case EOpportunityAction.Delete:
        // Handle delete
        this.deleteConfirmDialogVisible.set(true);
        break;
      case EOpportunityAction.MoveToDraft:
        // Handle move to draft
        this.moveToDraftConfirmDialogVisible.set(true);
        break;
      case EOpportunityAction.Publish:
        // Handle publish
        this.publishConfirmDialogVisible.set(true);
        break;
    }
  }

  handelDeleteOpportunity() {
    this.deleteConfirmDialogVisible.set(true);
  }

  deleteOpportunity() {
    this.adminOpportunitiesStore
      .deleteOpportunity(this.opportunityId()!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleteConfirmDialogVisible.set(false);
          this.toast.success(this.i18nService.translate('opportunity.messages.deletedSuccess'));
          this.onBack();
        },
        error: () => {
          this.deleteConfirmDialogVisible.set(false);
        },
      });
  }

  moveToDraftOpportunity() {
    this.adminOpportunitiesStore
      .moveToDraftOpportunity(this.opportunityId()!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toast.success(this.i18nService.translate('opportunity.messages.movedToDraftSuccess'));
          this.moveToDraftConfirmDialogVisible.set(false);
          this.getOpportunityDetails();
        },
        error: () => {
          this.moveToDraftConfirmDialogVisible.set(false);
        }
      });
  }

  publishOpportunity() {
    this.adminOpportunitiesStore
      .publishOpportunity(this.opportunityId()!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toast.success(this.i18nService.translate('opportunity.messages.publishedSuccess'));
          this.publishConfirmDialogVisible.set(false);
          this.getOpportunityDetails();
        },
      });
  }

  onUserReadAndApproved() {
    this.planTermsAndConditionsDialogVisibility.set(false);
    this.opportunitiesStore.details()?.opportunityType === EOpportunityType.PRODUCT
      ? this.productLocalizationPlanWizardVisibility.set(true)
      : this.serviceLocalizationPlanWizardVisibility.set(true);
  }

  applyOpportunity(opportunityId: string, opportunityTitle: string) {
    this.planStore.setAvailableOpportunities({ id: opportunityId, name: opportunityTitle });
    this.planStore.setAppliedOpportunity({
      id: opportunityId,
      title: opportunityTitle,
      shortDescription: '',
      opportunityType: this.opportunitiesStore.details()?.opportunityType!,
      isApplied: false,
      isOtherOpportunity: false,
      icon: '',
      numberOfPlans: 0
    });
    this.planTermsAndConditionsDialogVisibility.set(true)
    this.planStore.setWizardMode('create');
    this.planStore.setSelectedPlanId(null);
  }

  onViewPlans() {
    this.router.navigate([environment.baseHref, ERoutes.plans], {
      queryParams: { opportunityId: this.opportunityId() }
    });
  }
  get opportunityAttachmentBase64() {
    const attachment = this.opportunitiesStore.details()?.attachments[0];

    return attachment?.ibmFileBase64?.fileBase64
      ? `data:${attachment.ibmFileBase64.fileBase64MimeType};base64,${attachment.ibmFileBase64.fileBase64}`
      : opportunityImagePlaceholder;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUnitLabel(): string {
    const unit = this.opportunitiesStore.details()?.quantityUnit as EOpportunityQuantity;
    if (!unit) return '';
    return '(' + this.opportunityUnitMapper.getUnitLabel(unit) + ')';
  }

  private normalizeDecimalSeparator(value: string | null | undefined): string | null | undefined {
    return value?.replace(/[,،٫]/g, '.');
  }

  getSpendSarDisplay(): string | number | null | undefined {
    const value = this.opportunitiesStore.details()?.spendSAR;
    if (value) {
      return `${this.normalizeDecimalSeparator(String(value))}B`;
    }
    return value;
  }

  getMinQuantityDisplay(): string | null | undefined {
    return this.normalizeDecimalSeparator(this.opportunitiesStore.details()?.minQuantityFormatted);
  }

  getMaxQuantityDisplay(): string | null | undefined {
    return this.normalizeDecimalSeparator(this.opportunitiesStore.details()?.maxQuantityFormatted);
  }

  getStatusConfig(): { label: string; color: TColors } {
    const status = this.opportunitiesStore.details()?.status;
    if (status === EOpportunityStatus.PUBLISHED) {
      return { label: 'opportunity.status.published', color: 'green' as const };
    }

    return { label: 'opportunity.status.draft', color: 'gray' as const };
  }

  getStateConfig(): { label: string; color: TColors } {
    const isActive = this.opportunitiesStore.details()?.isActive;
    if (isActive) {
      return { label: 'opportunity.state.active', color: 'green' as const };
    }

    return { label: 'opportunity.state.inactive', color: 'red' as const };
  }

  shouldShowWarning(): boolean {
    const details = this.opportunitiesStore.details();
    return !!details?.isActive && details.status === EOpportunityStatus.DRAFT;
  }

  getLocalSuppliersDisplay(): string | null | undefined {
    const value = this.opportunitiesStore.details()?.localSuppliersFormatted;
    if (value == null || value === '0') return value;
    const normalized = this.normalizeDecimalSeparator(value);
    return `${this.lri}${normalized}+${this.pdi}`;
  }

  getGlobalSuppliersDisplay(): string | null | undefined {
    const value = this.opportunitiesStore.details()?.globalSuppliersFormatted;
    if (value == null || value === '0') return value;
    const normalized = this.normalizeDecimalSeparator(value);
    return `${this.lri}${normalized}+${this.pdi}`;
  }

  isAdminPersona(): boolean {
    return this.permissionService.canAccessOnOpportunityAdmin();
  }
}
