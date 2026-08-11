import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { Files } from './files';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment.development';
import { FileMetadataInput } from '../files.models';

describe('Files', () => {
  let filesService: Files;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    filesService = TestBed.inject(Files);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('upload', () => {
    it('should POST file and metadata as FormData', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const metadata: FileMetadataInput = {
        displayName: 'Q3 Report',
        category: 'DOCUMENT',
        visibiilty: 'TEAM',
        tags: ['finance', 'q3'],
        notes: 'Board deck',
      };

      filesService.upload(file, metadata).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/files`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);

      const formData = req.request.body as FormData;
      expect(formData.get('file')).toBe(file);
      expect(formData.get('displayName')).toBe('Q3 Report');
      expect(formData.get('category')).toBe('DOCUMENT');
      expect(formData.get('visibility')).toBe('TEAM');
      expect(formData.getAll('tags')).toEqual(['finance', 'q3']);
      expect(formData.get('notes')).toBe('Board deck');

      req.flush(null);
    });

    it('should omit notes from FormData when empty', () => {
      const file = new File([''], 'empty.txt');
      const metadata: FileMetadataInput = {
        displayName: 'Empty',
        category: 'DOCUMENT',
        visibiilty: 'PRIVATE',
        tags: [],
        notes: '',
      };

      filesService.upload(file, metadata).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/files`);
      const formData = req.request.body as FormData;
      expect(formData.has('notes')).toBe(false);

      req.flush(null);
    });
  });

  describe('list', () => {
    it('should GET files with page and size params', () => {
      filesService.list({
        filters: { search: '', category: 'ALL' },
        page: 0,
        pageSize: 5,
      }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/files`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('5');
      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.params.has('category')).toBe(false);

      req.flush({ items: [], totalItems: 0, page: 0, pageSize: 5 });
    });

    it('should include search param when filter has search value', () => {
      filesService.list({
        filters: { search: 'report', category: 'ALL' },
        page: 1,
        pageSize: 10,
      }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/files`
      );
      expect(req.request.params.get('search')).toBe('report');
      expect(req.request.params.has('category')).toBe(false);

      req.flush({ items: [], totalItems: 0, page: 1, pageSize: 10 });
    });

    it('should include category param when not ALL', () => {
      filesService.list({
        filters: { search: '', category: 'DOCUMENT' },
        page: 0,
        pageSize: 5,
      }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/files`
      );
      expect(req.request.params.get('category')).toBe('DOCUMENT');
      expect(req.request.params.has('search')).toBe(false);

      req.flush({ items: [], totalItems: 0, page: 0, pageSize: 5 });
    });

    it('should include both search and category params', () => {
      filesService.list({
        filters: { search: 'finance', category: 'SPREADSHEET' },
        page: 2,
        pageSize: 5,
      }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/files`
      );
      expect(req.request.params.get('search')).toBe('finance');
      expect(req.request.params.get('category')).toBe('SPREADSHEET');
      expect(req.request.params.get('page')).toBe('2');

      req.flush({ items: [], totalItems: 0, page: 2, pageSize: 5 });
    });
  });

  describe('download', () => {
    it('should GET file download as blob', () => {
      const mockBlob = new Blob(['file content']);

      filesService.download('file-123').subscribe((blob) => {
        expect(blob).toBe(mockBlob);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/files/file-123/download`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');

      req.flush(mockBlob);
    });
  });
});
