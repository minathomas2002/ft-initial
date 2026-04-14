import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseTagComponent } from '../../base-components/base-tag/base-tag.component';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-optional-message',
  imports: [BaseTagComponent, TranslatePipe],
  templateUrl: './optional-message.html',
  styleUrl: './optional-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionalMessage { }
