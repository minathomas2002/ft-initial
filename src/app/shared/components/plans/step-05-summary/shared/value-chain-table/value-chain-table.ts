import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SummaryTableCell } from '../summary-table-cell/summary-table-cell';

@Component({
  selector: 'app-value-chain-table',
  imports: [CommonModule, TableModule, SummaryTableCell],
  templateUrl: './value-chain-table.html',
  styleUrl: './value-chain-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChainTable {
  tableData = input.required<any[]>();
  readonly years = [1, 2, 3, 4, 5, 6, 7];
}
