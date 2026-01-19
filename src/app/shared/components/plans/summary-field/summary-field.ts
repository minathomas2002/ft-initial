import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-summary-field',
  imports: [TooltipModule],
  templateUrl: './summary-field.html',
  styleUrl: './summary-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryField {
  label = input.required<string>();
  value = input<any>(null);
  beforeValue = input<any>(null);
  afterValue = input<any>(null);
  showDiff = input<boolean>(false);
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
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
