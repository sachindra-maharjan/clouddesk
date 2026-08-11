export type FileCategory = 'DOCUMENT' | 'SPREADSHEET' | 'PRESENTATION' | 'IMAGE' | 'ARCHIVE';
export type FileVisibility = 'TEAM' | 'PRIVATE';

export interface FileMetadataInput {
    displayName: string;
    category: FileCategory;
    visibiilty: FileVisibility;
    tags: string[];
    notes: string;
}
export interface UploadFileRequest {
    file: File;
    metadata: FileMetadataInput;
}

export interface FileSummary {
    id: string;
    displayName: string;
    originalFilename: string;
    category: FileCategory;
    visibility: FileVisibility;
    tags: string[];
    notes: string;
    ownerName: string;
    sizeBytes: number;
    uploadedAt: string;
}

export interface FileListFilters {
    search: string;
    category: FileCategory | 'ALL';
}

export interface FilePage {
    items: FileSummary[];
    page: number;
    pageSize: number;
    totalItems: number;
}
