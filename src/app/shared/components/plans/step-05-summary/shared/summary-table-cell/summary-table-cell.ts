import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-table-cell',
  imports: [TooltipModule, CommonModule],
  templateUrl: './summary-table-cell.html',
  styleUrl: './summary-table-cell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryTableCell {
  value = input<any>(null);
  hasError = input<boolean>(false);

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'object' && value !== null) {
      if (value.name) {
        return value.name;
      }
      return JSON.stringify(value);
    }
    return String(value);
  }
}
