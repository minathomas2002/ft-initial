import { NgClass } from '@angular/common';
import { Component, input, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

@Component({
  selector: 'app-summary-table-cell',
  imports: [TooltipModule, NgClass],
  templateUrl: './summary-table-cell.html',
  styleUrl: './summary-table-cell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryTableCell {
  private readonly i18nService = inject(I18nService);

  value = input<any>(null);
  beforeValue = input<any>(null);
  afterValue = input<any>(null);
  showDiff = input<boolean>(false);
  hasError = input<boolean>(false);
  hasComment = input<boolean>(false);
  isResolved = input<boolean>(false);
  isDate = input<boolean>(false);
  isBoolean = input<boolean>(false);
  isEmpty = input<boolean>(false);

  displayValue = computed(() => {
    // If has comment but no diff, show the old value (beforeValue)
    if (this.hasComment() && !this.showDiff() && this.beforeValue() !== null && this.beforeValue() !== undefined) {
      return this.displayBeforeValue();
    }

    if (this.showDiff() && this.hasDiff()) {
      return this.displayAfterValue();
    }

    if (this.isEmpty()) {
      return '-';
    }

    if (this.isBoolean()) {
      return this.value() ? 'Yes' : 'No';
    }

    if (this.isDate() && this.value()) {
      const date = new Date(this.value());
      const locale = this.i18nService.currentLanguage() === 'ar' ? 'ar-SA' : 'en-GB';
      return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
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

  displayBeforeValue = computed(() => {
    const val = this.beforeValue();
    if (val === null || val === undefined || val === '') {
      return '-';
    }

    if (this.isBoolean()) {
      return val ? 'Yes' : 'No';
    }

    if (this.isDate() && val) {
      const date = new Date(val);
      const locale = this.i18nService.currentLanguage() === 'ar' ? 'ar-SA' : 'en-GB';
      return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (typeof val === 'object' && val !== null) {
      if (val.name) {
        return val.name;
      }
      return JSON.stringify(val);
    }

    return String(val);
  });

  displayAfterValue = computed(() => {
    const val = this.afterValue() ?? this.value();
    if (val === null || val === undefined || val === '') {
      return '-';
    }

    if (this.isBoolean()) {
      return val ? 'Yes' : 'No';
    }

    if (this.isDate() && val) {
      const date = new Date(val);
      const locale = this.i18nService.currentLanguage() === 'ar' ? 'ar-SA' : 'en-GB';
      return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (typeof val === 'object' && val !== null) {
      if (val.name) {
        return val.name;
      }
      return JSON.stringify(val);
    }

    return String(val);
  });

  hasDiff = computed(() => {
    if (!this.showDiff()) return false;
    const before = this.beforeValue();
    const after = this.afterValue() ?? this.value();

    // Compare values
    if (before === after) return false;
    if (before === null || before === undefined || before === '') {
      return after !== null && after !== undefined && after !== '';
    }
    if (after === null || after === undefined || after === '') {
      return true;
    }

    // For objects, compare by JSON stringify
    if (typeof before === 'object' && typeof after === 'object') {
      return JSON.stringify(before) !== JSON.stringify(after);
    }

    return String(before) !== String(after);
  });
}
