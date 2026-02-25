import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-personal-information-section',
  imports: [
    PersonalInformationCard,
    PersonalInformationFormField,
    PersonalInformationSkeleton,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    PhoneInputComponent,
    BaseErrorMessages
  ],
  providers: [PersonalInformationFormService],
  templateUrl: './personal-information-section.html',
  styleUrl: './personal-information-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationSection implements OnInit {
  protected formService = inject(PersonalInformationFormService);
  protected viewMode = signal<EViewMode>(EViewMode.View);
  protected isViewMode = computed(() => this.viewMode() === EViewMode.View);

  /** When true, shows skeleton placeholders; when false, shows the form. Wire to your data loading state. */
  isLoading = input<boolean>(false);

  ngOnInit(): void {
    this.formService.initializeForm({
      fullName: null,
      email: 'john.doe@example.com',
      phoneNumber: {
        countryCode: '966',
        phoneNumber: '555555555'
      },
      otherPhoneNumber: {
        countryCode: '966',
        phoneNumber: '555555555'
      },
      benaId: '1234567890',
      secRegisteredId: '1234567',
    });
    this.formService.updateViewMode(this.viewMode());
    console.log(this.formService.personalInformationForm.invalid);

  }
}
