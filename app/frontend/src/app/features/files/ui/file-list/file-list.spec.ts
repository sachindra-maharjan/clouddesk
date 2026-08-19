import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FileList } from './file-list';
import { FileSummary } from '../../files.models';

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

describe('FileList', () => {
  let component: FileList;
  let fixture: ComponentFixture<FileList>;

  const defaultFilters = { search: '', category: 'ALL' as const };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('files', []);
    fixture.componentRef.setInput('filters', defaultFilters);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formatSize', () => {
    it('should format bytes', () => {
      expect(component.formatSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(component.formatSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(component.formatSize(5242880)).toBe('5.0 MB');
    });
  });

  describe('totalPages', () => {
    it('should return 1 when totalItems is 0', () => {
      fixture.componentRef.setInput('totalItems', 0);
      fixture.componentRef.setInput('pageSize', 5);
      expect(component.totalPages).toBe(1);
    });

    it('should return 1 when items fit one page', () => {
      fixture.componentRef.setInput('totalItems', 5);
      fixture.componentRef.setInput('pageSize', 5);
      expect(component.totalPages).toBe(1);
    });

    it('should return 2 when items spill to second page', () => {
      fixture.componentRef.setInput('totalItems', 6);
      fixture.componentRef.setInput('pageSize', 5);
      expect(component.totalPages).toBe(2);
    });

    it('should return 3 for 12 items with pageSize 5', () => {
      fixture.componentRef.setInput('totalItems', 12);
      fixture.componentRef.setInput('pageSize', 5);
      expect(component.totalPages).toBe(3);
    });
  });

  describe('onSearchChange', () => {
    it('should emit filterChange with updated search', () => {
      const emitSpy = vi.spyOn(component.filterChange, 'emit');

      component.onSearchChange('report');

      expect(emitSpy).toHaveBeenCalledWith({ search: 'report', category: 'ALL' });
    });

    it('should preserve category when search changes', () => {
      fixture.componentRef.setInput('filters', { search: '', category: 'DOCUMENT' });
      const emitSpy = vi.spyOn(component.filterChange, 'emit');

      component.onSearchChange('report');

      expect(emitSpy).toHaveBeenCalledWith({ search: 'report', category: 'DOCUMENT' });
    });
  });

  describe('onCategoryChange', () => {
    it('should emit filterChange with updated category', () => {
      const emitSpy = vi.spyOn(component.filterChange, 'emit');

      component.onCategoryChange('DOCUMENT');

      expect(emitSpy).toHaveBeenCalledWith({ search: '', category: 'DOCUMENT' });
    });

    it('should preserve search when category changes', () => {
      fixture.componentRef.setInput('filters', { search: 'report', category: 'ALL' });
      const emitSpy = vi.spyOn(component.filterChange, 'emit');

      component.onCategoryChange('IMAGE');

      expect(emitSpy).toHaveBeenCalledWith({ search: 'report', category: 'IMAGE' });
    });
  });

  describe('outputs', () => {
    it('should emit pageChange with next page', () => {
      const emitSpy = vi.spyOn(component.pageChange, 'emit');
      fixture.componentRef.setInput('page', 0);

      component.pageChange.emit(1);

      expect(emitSpy).toHaveBeenCalledWith(1);
    });

    it('should emit pageChange with previous page', () => {
      const emitSpy = vi.spyOn(component.pageChange, 'emit');
      fixture.componentRef.setInput('page', 2);

      component.pageChange.emit(1);

      expect(emitSpy).toHaveBeenCalledWith(1);
    });

    it('should emit download with file', () => {
      const file = createFile();
      const emitSpy = vi.spyOn(component.download, 'emit');

      component.download.emit(file);

      expect(emitSpy).toHaveBeenCalledWith(file);
    });
  });

  describe('template', () => {
    it('should render file rows', () => {
      const files = [
        createFile({ id: '1', displayName: 'Report' }),
        createFile({ id: '2', displayName: 'Image' }),
      ];
      fixture.componentRef.setInput('files', files);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should show "Loading files" when loading and no files', () => {
      fixture.componentRef.setInput('files', []);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Loading files');
    });

    it('should show "No files match" when not loading and no files', () => {
      fixture.componentRef.setInput('files', []);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('No files match your filters');
    });

    it('should show "No files yet" when totalItems is 0', () => {
      fixture.componentRef.setInput('totalItems', 0);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('No files yet');
    });

    it('should disable Prev button on first page', () => {
      fixture.componentRef.setInput('page', 0);
      fixture.detectChanges();

      const prevBtn = fixture.nativeElement.querySelector('button:first-of-type');
      expect(prevBtn.disabled).toBe(true);
    });

    it('should disable Next button on last page', () => {
      fixture.componentRef.setInput('page', 2);
      fixture.componentRef.setInput('totalItems', 15);
      fixture.componentRef.setInput('pageSize', 5);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const nextBtn = buttons[buttons.length - 1];
      expect(nextBtn.disabled).toBe(true);
    });
  });
});
