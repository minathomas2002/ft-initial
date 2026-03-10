import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-summary-section-header',
  imports: [ButtonModule, TooltipModule, TranslatePipe],
  templateUrl: './summary-section-header.html',
  styleUrl: './summary-section-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionHeader {
  hideEditButton = input<boolean>(false);
  showExpandButton = input<boolean>(true);
  isExpanded = input<boolean>(false);
  title = input.required<string>();
  onEdit = output<void>();
  onToggleExpand = output<void>();

  onEditClick(): void {
    this.onEdit.emit();
  }

  onToggleExpandClick(): void {
    this.onToggleExpand.emit();
  }
}
