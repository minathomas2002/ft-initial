import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SectionsLayout } from 'src/app/shared/components/layout-components/sections-layout/sections-layout';
import { PersonalInformationSection } from '../../components/personal-information-section/personal-information-section';
import { UserImageSection } from '../../components/user-image-section/user-image-section';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { ERoles } from 'src/app/shared/enums';
import { SignatureSection } from '../../components/signature-section/signature-section';

@Component({
  selector: 'app-personal-information-view',
  imports: [
    SectionsLayout,
    UserImageSection,
    PersonalInformationSection,
    SignatureSection,
  ],
  templateUrl: './personal-information-view.html',
  styleUrl: './personal-information-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationView {
  private roleService = inject(RoleService);
  protected canViewSignature = computed(() => this.roleService.hasAnyRoleSignal(
    [ERoles.INVESTOR, ERoles.DEPARTMENT_MANAGER])
    ());
}
