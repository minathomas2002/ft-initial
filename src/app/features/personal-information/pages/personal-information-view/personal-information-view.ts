import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionsLayout } from 'src/app/shared/components/layout-components/sections-layout/sections-layout';
import { PersonalInformationSection } from '../../components/personal-information-section/personal-information-section';
import { UserImageSection } from '../../components/user-image-section/user-image-section';

@Component({
  selector: 'app-personal-information-view',
  imports: [
    SectionsLayout,
    UserImageSection,
    PersonalInformationSection,
  ],
  templateUrl: './personal-information-view.html',
  styleUrl: './personal-information-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationView { }
