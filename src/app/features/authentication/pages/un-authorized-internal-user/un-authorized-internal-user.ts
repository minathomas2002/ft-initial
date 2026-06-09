import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-un-authorized-internal-user',
  templateUrl: './un-authorized-internal-user.html',
  styleUrl: './un-authorized-internal-user.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class UnAuthorizedInternalUser {}
