import { inject, Service } from '@angular/core';
import { FileListFilters, FileMetadataInput } from '../files.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { FilePage } from '../files.models';

export interface ListFilesParams {
    filters: FileListFilters;
    page: number;
    pageSize: number;
    sortBy?: string;
    sortDir?: string;
}

@Service()
export class Files {
    private readonly http = inject(HttpClient);

    upload(file: File, metadata: FileMetadataInput): Observable<void> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('displayName', metadata.displayName);
        formData.append('category', metadata.category);
        formData.append('visibility', metadata.visibiilty);
        metadata.tags.forEach((tag) => formData.append('tags', tag))
        if (metadata.notes) {
            formData.append('notes', metadata.notes);
        }

        return this.http.post<void>(`${environment.apiUrl}/files`, formData);
    }

    list(params: ListFilesParams): Observable<FilePage> {
        let httpParams = new HttpParams()
            .set('page', params.page)
            .set('size', params.pageSize);

        if (params.filters.search) {
            httpParams = httpParams.set('search', params.filters.search);
        }
        if (params.filters.category != 'ALL') {
            httpParams = httpParams.set('category', params.filters.category);
        }
        if (params.sortBy) {
            httpParams = httpParams.set('sortBy', params.sortBy);
        }
        if (params.sortDir) {
            httpParams = httpParams.set('sortDir', params.sortDir);
        }

        return this.http.get<FilePage>(`${environment.apiUrl}/files`, { params: httpParams });
    }

    download(fileId: string): Observable<Blob> {
        return this.http.get(`${environment.apiUrl}/files/${fileId}/download`, { responseType: 'blob' });
    }

}
