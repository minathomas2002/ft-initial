import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { SignaturePadComponent } from 'src/app/shared/components/plans/submission-confirmation-modal/signature-pad/signature-pad.component';
import { EViewMode } from 'src/app/shared/enums';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-signature-section',
  imports: [
    PersonalInformationCard,
    SignaturePadComponent,
    ButtonModule
  ],
  templateUrl: './signature-section.html',
  styleUrl: './signature-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignatureSection {
  viewMode = input<EViewMode>(EViewMode.View);
  isViewMode = computed(() => this.viewMode() === EViewMode.View);
  existingSignature = signal<string | null>(null);


  onAddSignatureClick(): void { }

  onChangeSignatureClick(): void { }
}
