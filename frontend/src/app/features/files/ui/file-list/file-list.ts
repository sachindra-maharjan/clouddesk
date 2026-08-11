import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FileCategory, FileListFilters, FileSummary } from '../../files.models';

@Component({
  selector: 'app-file-list',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-list.html',
  styleUrl: './file-list.css',
})
export class FileList {
  readonly files = input.required<FileSummary[]>();
  readonly loading = input(false);
  readonly filters = input.required<FileListFilters>();
  readonly page = input(0);
  readonly pageSize = input(5);
  readonly totalItems = input(0);

  readonly filterChange = output<FileListFilters>();
  readonly pageChange = output<number>();
  readonly download = output<FileSummary>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  }

  onSearchChange(value: string): void {
    this.filterChange.emit({ ...this.filters(), search: value });
  }

  onCategoryChange(value: string): void {
    this.filterChange.emit({ ...this.filters(), category: value as FileCategory });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

}
