import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { FileMetadataInput, UploadFileRequest } from '../../files.models';

@Component({
  selector: 'app-upload-panel',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload-panel.html',
  styleUrl: './upload-panel.css',
})
export class UploadPanel {

  private readonly fb = inject(FormBuilder);

  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly upload = output<UploadFileRequest>();

  readonly selectedFile = signal<File | null>(null);
  readonly isDraggingOver = signal<boolean>(false);

  readonly form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    category: ['DOCUMENT' as FileMetadataInput['category'], Validators.required],
    visibility: ['TEAM' as FileMetadataInput['visibiilty'], Validators.required],
    tags: [''],
    notes: [''],
  });

  private readonly formValid = toSignal(
    this.form.statusChanges.pipe(map(() => this.form.valid)),
    { initialValue: this.form.valid }
  );

  readonly canSubmit = computed(() => this.formValid() && this.selectedFile() != null && !this.loading());

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver.set(true);
  }

  onDragLeave(): void {
    this.isDraggingOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  onSubmit(): void {
    const file = this.selectedFile();
    if (this.form.invalid || !file) {
      console.log("invalid form")
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const metadata: FileMetadataInput = {
      displayName: raw.displayName,
      category: raw.category,
      visibiilty: raw.visibility,
      tags: raw.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
      notes: raw.notes,
    };

    this.upload.emit({ file, metadata });
  }

  resetAfterSuccess(): void {
    this.form.reset({
      displayName: '',
      category: 'DOCUMENT',
      visibility: 'TEAM',
      tags: '',
      notes: '',
    });
  }

}
