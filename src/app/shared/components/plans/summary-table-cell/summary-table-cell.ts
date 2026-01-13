import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-summary-table-cell',
  imports: [TooltipModule],
  templateUrl: './summary-table-cell.html',
  styleUrl: './summary-table-cell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryTableCell {
  value = input<any>(null);
  hasError = input<boolean>(false);
  hasComment = input<boolean>(false);
  isDate = input<boolean>(false);
  isBoolean = input<boolean>(false);
  isEmpty = input<boolean>(false);

  displayValue = computed(() => {
    if (this.isEmpty()) {
      return '-';
    }

    if (this.isBoolean()) {
      return this.value() ? 'Yes' : 'No';
    }

    if (this.isDate() && this.value()) {
      const date = new Date(this.value());
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (this.value() === null || this.value() === undefined || this.value() === '') {
      return '-';
    }

    // Handle objects (like select options)
    if (typeof this.value() === 'object' && this.value() !== null) {
      if (this.value().name) {
        return this.value().name;
      }
      return JSON.stringify(this.value());
    }

    return String(this.value());
  });
}
