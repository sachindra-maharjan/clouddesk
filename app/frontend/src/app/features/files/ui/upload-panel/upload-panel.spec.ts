import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UploadPanel } from './upload-panel';

describe('UploadPanel', () => {
  let component: UploadPanel;
  let fixture: ComponentFixture<UploadPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPanel]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UploadPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form', () => {
    it('should initialize with default values', () => {
      expect(component.form.getRawValue()).toEqual({
        displayName: '',
        category: 'DOCUMENT',
        visibility: 'TEAM',
        tags: '',
        notes: '',
      });
    });

    it('should be invalid when displayName is empty', () => {
      expect(component.form.controls.displayName.valid).toBe(false);
      expect(component.form.valid).toBe(false);
    });

    it('should be valid when all required fields are filled', () => {
      component.form.controls.displayName.setValue('Test File');
      expect(component.form.valid).toBe(true);
    });
  });

  describe('canSubmit', () => {
    it('should be false when form is invalid and no file selected', () => {
      expect(component.canSubmit()).toBe(false);
    });

    it('should be false when form is valid but no file selected', () => {
      component.form.controls.displayName.setValue('Test File');
      expect(component.canSubmit()).toBe(false);
    });

    it('should be false when file is selected but form is invalid', () => {
      component.selectedFile.set(new File([''], 'test.png', { type: 'image/png' }));
      expect(component.canSubmit()).toBe(false);
    });

    it('should be true when form is valid and file is selected', () => {
      component.form.controls.displayName.setValue('Test File');
      component.selectedFile.set(new File([''], 'test.png', { type: 'image/png' }));
      expect(component.canSubmit()).toBe(true);
    });

    it('should be false when loading is true', () => {
      component.form.controls.displayName.setValue('Test File');
      component.selectedFile.set(new File([''], 'test.png', { type: 'image/png' }));
      fixture.componentRef.setInput('loading', true);
      expect(component.canSubmit()).toBe(false);
    });
  });

  describe('file selection', () => {
    it('should set selectedFile from file input change event', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', { value: [file] });

      const event = { target: input } as unknown as Event;
      component.onFileInputChange(event);

      expect(component.selectedFile()).toBe(file);
    });

    it('should set selectedFile to null when no file is selected', () => {
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', { value: [] });

      const event = { target: input } as unknown as Event;
      component.onFileInputChange(event);

      expect(component.selectedFile()).toBeNull();
    });
  });

  describe('drag and drop', () => {
    it('should set isDraggingOver to true on dragover', () => {
      const event = {
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      component.onDragOver(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDraggingOver()).toBe(true);
    });

    it('should set isDraggingOver to false on dragleave', () => {
      component.isDraggingOver.set(true);
      component.onDragLeave();
      expect(component.isDraggingOver()).toBe(false);
    });

    it('should set selectedFile on drop', () => {
      const file = new File(['content'], 'dropped.png', { type: 'image/png' });
      const event = {
        preventDefault: vi.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent;

      component.onDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDraggingOver()).toBe(false);
      expect(component.selectedFile()).toBe(file);
    });

    it('should not set selectedFile on drop when no files', () => {
      const event = {
        preventDefault: vi.fn(),
        dataTransfer: { files: [] },
      } as unknown as DragEvent;

      component.onDrop(event);

      expect(component.selectedFile()).toBeNull();
    });
  });

  describe('onSubmit', () => {
    it('should emit upload event with file and metadata', () => {
      const emitSpy = vi.spyOn(component.upload, 'emit');
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      component.form.controls.displayName.setValue('Q3 Report');
      component.form.controls.category.setValue('DOCUMENT');
      component.form.controls.visibility.setValue('TEAM');
      component.form.controls.tags.setValue('finance, q3');
      component.form.controls.notes.setValue('Board deck');
      component.selectedFile.set(file);

      component.onSubmit();

      expect(emitSpy).toHaveBeenCalledWith({
        file,
        metadata: {
          displayName: 'Q3 Report',
          category: 'DOCUMENT',
          visibiilty: 'TEAM',
          tags: ['finance', 'q3'],
          notes: 'Board deck',
        },
      });
    });

    it('should filter empty tags', () => {
      const emitSpy = vi.spyOn(component.upload, 'emit');
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      component.form.controls.displayName.setValue('Test');
      component.form.controls.tags.setValue(',, ,');
      component.selectedFile.set(file);

      component.onSubmit();

      expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({
        metadata: expect.objectContaining({ tags: [] }),
      }));
    });

    it('should not emit when form is invalid', () => {
      const emitSpy = vi.spyOn(component.upload, 'emit');
      component.selectedFile.set(new File([''], 'test.png'));

      component.onSubmit();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should not emit when no file is selected', () => {
      const emitSpy = vi.spyOn(component.upload, 'emit');
      component.form.controls.displayName.setValue('Test');

      component.onSubmit();

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('resetAfterSuccess', () => {
    it('should reset form to default values', () => {
      component.form.controls.displayName.setValue('Modified');
      component.form.controls.tags.setValue('modified-tag');

      component.resetAfterSuccess();

      expect(component.form.getRawValue()).toEqual({
        displayName: '',
        category: 'DOCUMENT',
        visibility: 'TEAM',
        tags: '',
        notes: '',
      });
    });
  });

  describe('auto reset after success', () => {
    it('should reset form when loading transitions from true to false without error', async () => {
      component.form.controls.displayName.setValue('Test File');
      component.selectedFile.set(new File([''], 'test.png'));
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();

      fixture.componentRef.setInput('loading', false);
      await fixture.whenStable();

      expect(component.form.controls.displayName.value).toBe('');
      expect(component.selectedFile()).toBeNull();
    });

    it('should not reset form when loading transitions to false with error', async () => {
      component.form.controls.displayName.setValue('Test File');
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();

      fixture.componentRef.setInput('errorMessage', 'Upload failed');
      fixture.componentRef.setInput('loading', false);
      await fixture.whenStable();

      expect(component.form.controls.displayName.value).toBe('Test File');
    });
  });

  describe('inputs', () => {
    it('should default loading to false', () => {
      expect(component.loading()).toBe(false);
    });

    it('should default errorMessage to null', () => {
      expect(component.errorMessage()).toBeNull();
    });
  });
});
