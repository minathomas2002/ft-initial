import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-design-engineering-note',
  imports: [TranslatePipe],
  templateUrl: './design-engineering-note.html',
  styleUrl: './design-engineering-note.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignEngineeringNote { }
