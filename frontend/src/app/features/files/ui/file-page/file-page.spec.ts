import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FilePage } from './file-page';
import { FilesStore } from '../../data-access/files.store';
import { FileListFilters, FileSummary, UploadFileRequest } from '../../files.models';

describe('FilePage', () => {
  let component: FilePage;
  let fixture: ComponentFixture<FilePage>;

  let storeMock: {
    upload: ReturnType<typeof vi.fn>;
    setFilters: ReturnType<typeof vi.fn>;
    download: ReturnType<typeof vi.fn>;
    setPage: ReturnType<typeof vi.fn>;
    items: ReturnType<typeof vi.fn>;
    filters: ReturnType<typeof vi.fn>;
    totalItems: ReturnType<typeof vi.fn>;
    page: ReturnType<typeof vi.fn>;
    pageSize: ReturnType<typeof vi.fn>;
    uploading: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    storeMock = {
      upload: vi.fn(),
      setFilters: vi.fn(),
      download: vi.fn(),
      setPage: vi.fn(),
      items: vi.fn().mockReturnValue([]),
      filters: vi.fn().mockReturnValue({ search: '', category: 'ALL' }),
      totalItems: vi.fn().mockReturnValue(0),
      page: vi.fn().mockReturnValue(0),
      pageSize: vi.fn().mockReturnValue(5),
      uploading: vi.fn().mockReturnValue(false),
      error: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [FilePage],
      providers: [
        { provide: FilesStore, useValue: storeMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleUpload', () => {
    it('should call filesStore.upload with the request', () => {
      const file = new File([''], 'test.pdf');
      const request: UploadFileRequest = {
        file,
        metadata: {
          displayName: 'Test',
          category: 'DOCUMENT',
          visibiilty: 'TEAM',
          tags: [],
          notes: '',
        },
      };

      component.handleUpload(request);

      expect(storeMock.upload).toHaveBeenCalledWith(request);
    });
  });

  describe('handleFilterChange', () => {
    it('should call filesStore.setFilters with new filters', () => {
      const filters: FileListFilters = { search: 'report', category: 'DOCUMENT' };

      component.handleFilterChange(filters);

      expect(storeMock.setFilters).toHaveBeenCalledWith(filters);
    });
  });

  describe('handleDownload', () => {
    it('should call filesStore.download with the file', () => {
      const file: FileSummary = {
        id: '1',
        displayName: 'Report',
        originalFilename: 'report.pdf',
        category: 'DOCUMENT',
        visibility: 'TEAM',
        tags: [],
        notes: '',
        ownerName: 'Alice',
        sizeBytes: 1024,
        uploadedAt: '2026-08-01T00:00:00Z',
      };

      component.handleDownload(file);

      expect(storeMock.download).toHaveBeenCalledWith(file);
    });
  });

  describe('handlePageChange', () => {
    it('should call filesStore.setPage with the page number', () => {
      component.handlePageChange(2);

      expect(storeMock.setPage).toHaveBeenCalledWith(2);
    });
  });
});
