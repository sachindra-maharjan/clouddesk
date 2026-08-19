import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { UploadPanel } from '../upload-panel/upload-panel';
import { FileList } from '../file-list/file-list';
import { FileListFilters, FileSummary, UploadFileRequest } from '../../files.models';
import { FilesStore } from '../../data-access/files.store';

const MOCK_FILES: FileSummary[] = [
  {
    id: '1', displayName: 'q3-forecast.xlsx', originalFilename: 'q3-forecast.xlsx',
    category: 'SPREADSHEET', visibility: 'TEAM', tags: ['finance'], notes: '',
    ownerName: 'R. Chen', sizeBytes: 2_400_000, uploadedAt: '2026-07-27T09:38:00Z',
  },
  {
    id: '2', displayName: 'brand-assets.zip', originalFilename: 'brand-assets.zip',
    category: 'ARCHIVE', visibility: 'TEAM', tags: ['design'], notes: '',
    ownerName: 'J. Kim', sizeBytes: 184_000_000, uploadedAt: '2026-07-27T08:41:00Z',
  },
  {
    id: '3', displayName: 'security-audit.pdf', originalFilename: 'security-audit.pdf',
    category: 'DOCUMENT', visibility: 'PRIVATE', tags: ['security'], notes: '',
    ownerName: 'S. Patel', sizeBytes: 1_200_000, uploadedAt: '2026-07-26T14:05:00Z',
  },
];


@Component({
  selector: 'app-file-page',
  imports: [UploadPanel, FileList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-page.html',
  styleUrl: './file-page.css',
})
export class FilePage {

  protected readonly filesStore = inject(FilesStore);

  handleUpload(req: UploadFileRequest): void {
    this.filesStore.upload(req);
  }

  handleFilterChange(filters: FileListFilters): void {
    this.filesStore.setFilters(filters);
  }

  handleDownload(file: FileSummary): void {
    this.filesStore.download(file);
  }

  handlePageChange(page: number): void {
    this.filesStore.setPage(page);
  }

}
