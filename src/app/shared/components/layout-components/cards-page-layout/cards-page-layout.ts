import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-cards-page-layout',
  imports: [],
  templateUrl: './cards-page-layout.html',
  styleUrl: './cards-page-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsPageLayout {
  pageTitle = input.required<string>();
  pageSubTitle = input.required<string>();
  pageTitleClass = input<string>('font-semibold xl:text-2xl text-lg');
  pageSubTitleClass = input<string>('xl:text-md text-sm text-gray-600');
}
