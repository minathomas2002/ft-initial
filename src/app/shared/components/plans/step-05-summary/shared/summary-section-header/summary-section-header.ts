import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-summary-section-header',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './summary-section-header.html',
  styleUrl: './summary-section-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionHeader {
  isViewMode = input<boolean>(false);
  title = input.required<string>();
  onEdit = output<void>();

  onEditClick(): void {
    this.onEdit.emit();
  }
}
