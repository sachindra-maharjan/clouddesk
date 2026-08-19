import { Component, input, output } from '@angular/core';
import { FileSortField, FileSummary, SortDirection } from '../../../files/files.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent-files-table',
  imports: [CommonModule],
  templateUrl: './recent-files-table.html',
  styleUrl: './recent-files-table.css',
})
export class RecentFilesTable {
  readonly files = input.required<FileSummary[]>();
  readonly sortBy = input.required<FileSortField>();
  readonly sortDir = input.required<SortDirection>();

  readonly sortChange = output<FileSortField>();

  sortIndicator(field: string): string {
    if (this.sortBy() !== field) return '';
    return this.sortDir() === 'ASC' ? '▲' : '▼';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

}
