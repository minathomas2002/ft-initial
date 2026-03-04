import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SectionsLayout } from 'src/app/shared/components/layout-components/sections-layout/sections-layout';
import { PersonalInformationSection } from '../../components/personal-information-section/personal-information-section';
import { UserImageSection } from '../../components/user-image-section/user-image-section';
import { SignatureSection } from '../../components/signature-section/signature-section';
import { SecuritySection } from '../../components/security-section/security-section';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { take } from 'rxjs';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { ERoles } from 'src/app/shared/enums';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-personal-information-view',
  imports: [
    SectionsLayout,
    TranslatePipe,
    UserImageSection,
    PersonalInformationSection,
    SecuritySection,
    SignatureSection,
  ],
  templateUrl: './personal-information-view.html',
  styleUrl: './personal-information-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationView {
  private profileStore = inject(ProfileStore);
  private roleService = inject(RoleService);
  canViewSignature = computed(() => this.profileStore.isInvestor() || this.roleService.hasAnyRoleSignal([ERoles.DEPARTMENT_MANAGER])());
  canViewSecurity = computed(() => this.profileStore.isInvestor());

  refreshUserDate() {
    console.log('refreshUserDate');

    this.profileStore.getUserProfile()
      .pipe(take(1))
      .subscribe();
  }
}
