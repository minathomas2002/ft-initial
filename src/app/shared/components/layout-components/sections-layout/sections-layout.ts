import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-sections-layout',
  imports: [],
  templateUrl: './sections-layout.html',
  styleUrl: './sections-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionsLayout {
  pageTitle = input<string>('');
}
