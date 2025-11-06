import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { NgTemplateOutlet } from '@angular/common';
import type { ITableHeaderItem } from '../../../interfaces';
@Component({
  selector: 'app-table-skeleton',
  imports: [TableModule, SkeletonModule, NgTemplateOutlet],
  templateUrl: './table-skeleton.component.html',
  styleUrl: './table-skeleton.component.scss',
})
export class TableSkeletonComponent {
  headers = input<ITableHeaderItem<unknown>[]>([]);
  items = Array.from({ length: 15 }).map((_, i) => `Item #${i}`);
  isLoading = input<boolean>(true);
}
