import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { PersonalInformationFormField } from '../personal-information-form-field/personal-information-form-field';
import { PersonalInformationSkeleton } from '../personal-information-skeleton/personal-information-skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PersonalInformationFormService } from '../../services/personal-information-form';
import { EViewMode } from 'src/app/shared/enums';
import { ReactiveFormsModule } from '@angular/forms';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { take } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n';
import { IUpdatePersonalInfoRequest } from 'src/app/shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-personal-information-section',
  imports: [
    TranslatePipe,
    PersonalInformationCard,
    PersonalInformationFormField,
    PersonalInformationSkeleton,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    PhoneInputComponent,
    BaseErrorMessages,
    ButtonModule,
  ],
  providers: [PersonalInformationFormService],
  templateUrl: './personal-information-section.html',
  styleUrl: './personal-information-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationSection implements OnInit {
  private profileStore = inject(ProfileStore);
  private toasterService = inject(ToasterService);
  private i18nService = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);
  protected formService = inject(PersonalInformationFormService);
  protected viewMode = signal<EViewMode>(EViewMode.View);
  protected isViewMode = computed(() => this.viewMode() === EViewMode.View);
  protected isInvestor = computed(() => this.profileStore.isInvestor());
  protected userProfile = computed(() => this.profileStore.userProfile());
  protected userID = computed(() => this.profileStore.userID());
  protected RoleName = computed(() => this.profileStore.RoleName());
  protected personalInfoProcessing = computed(() => this.profileStore.personalInfoProcessing());
  protected onPersonalInfoUpdate = output<void>();


  /** When true, shows skeleton placeholders; when false, shows the form. Wire to your data loading state. */
  isLoading = computed(() => this.profileStore.loading());

  ngOnInit(): void {
    this.formService.updateViewMode(this.viewMode());
    this.profileStore.getUserProfile()
      .pipe(take(1))
      .subscribe((res) => {
        if (res.success && res.body) {
          this.formService.initializeForm(res.body);
        }
      });
  }

  onEditClick(): void {
    this.viewMode.set(EViewMode.Edit);
    this.formService.updateViewMode(this.viewMode());
    this.cdr.markForCheck();
    // Defer second check: form enable propagates to CVAs asynchronously
    queueMicrotask(() => this.cdr.markForCheck());
  }

  onRegisteredVendorIDWithSecInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    if (!inputEl) return;

    const rawValue = inputEl.value ?? '';
    const digitsOnly = rawValue.replace(/\D+/g, '').slice(0, 7);

    if (digitsOnly !== rawValue) {
      inputEl.value = digitsOnly;
    }

    const ctrl = this.formService.secRegisteredId;
    if (!ctrl) return;
    ctrl.setValue(digitsOnly, { emitEvent: false });
  }

  onCancelClick(): void {
    this.viewMode.set(EViewMode.View);
    this.formService.initializeForm(this.profileStore.userProfile()!);
    this.formService.updateViewMode(this.viewMode());
    this.cdr.markForCheck();
    queueMicrotask(() => this.cdr.markForCheck());
  }

  onSubmit(): void {
    const request: IUpdatePersonalInfoRequest = {
      fullName: this.formService.fullName.value ?? '',
      countryCode: this.formService.phoneNumber.value?.countryCode ?? '',
      phoneNumber: this.formService.phoneNumber.value?.phoneNumber ?? '',
      otherPhoneCountryCode: this.formService.otherPhoneNumber.value?.countryCode ?? '',
      otherPhoneNumber: this.formService.otherPhoneNumber.value?.phoneNumber ?? '',
      secRegisteredId: this.formService.secRegisteredId.value ?? '',
    }
    this.profileStore.updatePersonalInfo(request).pipe(take(1))
      .subscribe((res) => {
        if (res.success) {
          this.toasterService.success(this.i18nService.translate('profile.messages.profileUpdated'));
          this.onPersonalInfoUpdate.emit();
          this.viewMode.set(EViewMode.View);
          this.formService.updateViewMode(this.viewMode());
        }
      });
  }

}
