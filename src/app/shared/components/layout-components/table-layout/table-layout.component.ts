import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-table-layout',
  imports: [],
  templateUrl: './table-layout.component.html',
  styleUrl: './table-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableLayoutComponent {
  tableTitle = input<string>('');
  tableSubTitle = input<string>('');
}
