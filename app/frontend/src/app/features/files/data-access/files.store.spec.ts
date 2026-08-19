import { TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FilesStore } from './files.store';
import { Files } from './files';
import { FilePage, FileSummary } from '../files.models';

const createFile = (overrides: Partial<FileSummary> = {}): FileSummary => ({
  id: '1',
  displayName: 'Q3 Report',
  originalFilename: 'q3-report.pdf',
  category: 'DOCUMENT',
  visibility: 'TEAM',
  tags: ['finance'],
  notes: '',
  ownerName: 'Alice',
  sizeBytes: 1024,
  uploadedAt: '2026-08-01T10:00:00Z',
  ...overrides,
});

const createFilePage = (overrides: Partial<FilePage> = {}): FilePage => ({
  items: [],
  page: 0,
  pageSize: 5,
  totalItems: 0,
  ...overrides,
});

describe('FilesStore', () => {
  let filesServiceMock: {
    list: ReturnType<typeof vi.fn>;
    upload: ReturnType<typeof vi.fn>;
    download: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    filesServiceMock = {
      list: vi.fn().mockReturnValue(of(createFilePage())),
      upload: vi.fn().mockReturnValue(of(null)),
      download: vi.fn().mockReturnValue(of(new Blob())),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Files, useValue: filesServiceMock },
      ],
    });
  });

  describe('initial state', () => {
    it('should start with empty items and default pagination', () => {
      const store = TestBed.inject(FilesStore);

      expect(store.items()).toEqual([]);
      expect(store.page()).toBe(0);
      expect(store.pageSize()).toBe(5);
      expect(store.totalItems()).toBe(0);
      expect(store.loading()).toBe(false);
      expect(store.uploading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.filters()).toEqual({ search: '', category: 'ALL' });
    });
  });

  describe('loadPage', () => {
    it('should call filesService.list with current state', () => {
      TestBed.inject(FilesStore);

      expect(filesServiceMock.list).toHaveBeenCalledWith({
        filters: { search: '', category: 'ALL' },
        page: 0,
        pageSize: 5,
      });
    });

    it('should update items and totalItems on success', () => {
      const files = [createFile({ id: '1' }), createFile({ id: '2' })];
      filesServiceMock.list.mockReturnValue(of(createFilePage({ items: files, totalItems: 2 })));
      const store = TestBed.inject(FilesStore);

      store.loadPage();

      expect(store.items()).toEqual(files);
      expect(store.totalItems()).toBe(2);
      expect(store.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      filesServiceMock.list.mockReturnValue(throwError(() => ({ status: 500 })));
      const store = TestBed.inject(FilesStore);

      store.loadPage();

      expect(store.error()).toBe('Could not load files.');
      expect(store.loading()).toBe(false);
    });

    it('should set loading to true while request is in flight', () => {
      filesServiceMock.list.mockReturnValue(NEVER);
      const store = TestBed.inject(FilesStore);

      store.loadPage();

      expect(store.loading()).toBe(true);
    });
  });

  describe('setFilters', () => {
    it('should update filters and reset page to 0', () => {
      const store = TestBed.inject(FilesStore);
      store.setPage(3);

      store.setFilters({ search: 'report', category: 'DOCUMENT' });

      expect(store.filters()).toEqual({ search: 'report', category: 'DOCUMENT' });
      expect(store.page()).toBe(0);
    });

    it('should debounce when search changes', () => {
      const store = TestBed.inject(FilesStore);
      filesServiceMock.list.mockClear();

      store.setFilters({ search: 'report', category: 'ALL' });

      // With debounce, the list call should not be immediate
      // The rxMethod debounce delays the call
      expect(filesServiceMock.list).not.toHaveBeenCalled();
    });

    it('should not debounce when only category changes', () => {
      const store = TestBed.inject(FilesStore);
      filesServiceMock.list.mockClear();

      store.setFilters({ search: '', category: 'DOCUMENT' });

      expect(filesServiceMock.list).toHaveBeenCalled();
    });
  });

  describe('setPage', () => {
    it('should update page and load', () => {
      const store = TestBed.inject(FilesStore);

      store.setPage(2);

      expect(store.page()).toBe(2);
      expect(filesServiceMock.list).toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    it('should set uploading to true while in flight', () => {
      filesServiceMock.upload.mockReturnValue(NEVER);
      const store = TestBed.inject(FilesStore);

      store.upload({ file: new File([''], 'test.pdf'), metadata: { displayName: 'Test', category: 'DOCUMENT', visibiilty: 'TEAM', tags: [], notes: '' } });

      expect(store.uploading()).toBe(true);
      expect(store.error()).toBeNull();
    });

    it('should call filesService.upload with file and metadata', () => {
      const store = TestBed.inject(FilesStore);
      const file = new File([''], 'test.pdf');
      const metadata = { displayName: 'Test', category: 'DOCUMENT' as const, visibiilty: 'TEAM' as const, tags: [], notes: '' };

      store.upload({ file, metadata });

      expect(filesServiceMock.upload).toHaveBeenCalledWith(file, metadata);
    });

    it('should reload page after successful upload', () => {
      filesServiceMock.list.mockClear();
      const store = TestBed.inject(FilesStore);

      store.upload({ file: new File([''], 'test.pdf'), metadata: { displayName: 'Test', category: 'DOCUMENT', visibiilty: 'TEAM', tags: [], notes: '' } });

      expect(store.uploading()).toBe(false);
      expect(filesServiceMock.list).toHaveBeenCalled();
    });

    it('should set error on upload failure', () => {
      filesServiceMock.upload.mockReturnValue(throwError(() => ({ status: 500 })));
      const store = TestBed.inject(FilesStore);

      store.upload({ file: new File([''], 'test.pdf'), metadata: { displayName: 'Test', category: 'DOCUMENT', visibiilty: 'TEAM', tags: [], notes: '' } });

      expect(store.error()).toBe('Could not upload file.');
      expect(store.uploading()).toBe(false);
    });
  });

  describe('download', () => {
    it('should call filesService.download and trigger browser download', () => {
      const mockBlob = new Blob(['content']);
      filesServiceMock.download.mockReturnValue(of(mockBlob));

      const anchor = { click: vi.fn(), href: '', download: '' };
      vi.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLAnchorElement);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const store = TestBed.inject(FilesStore);
      const file = createFile({ id: 'file-123', originalFilename: 'report.pdf' });

      store.download(file);

      expect(filesServiceMock.download).toHaveBeenCalledWith('file-123');
      expect(anchor.download).toBe('report.pdf');
      expect(anchor.click).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });
});
