import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { FileListFilters, FileMetadataInput, FileSummary } from "../files.models";
import { inject } from "@angular/core";
import { Files } from "./files";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { debounce, of, pipe, switchMap, tap, timer } from "rxjs";
import { tapResponse } from "@ngrx/operators";


interface FilesState {
    items: FileSummary[];
    page: number;
    pageSize: number;
    totalItems: number;
    filters: FileListFilters;
    loading: boolean;
    uploading: boolean;
    error: string | null;
}

const initialState: FilesState = {
    items: [],
    page: 0,
    pageSize: 5,
    totalItems: 0,
    filters: { search: '', category: 'ALL' },
    loading: false,
    uploading: false,
    error: null
}

export const FilesStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, filesService = inject(Files)) => {

        const loadPage = rxMethod<{ debounce?: boolean } | void>(
            pipe(
                debounce((config) => {
                    const shouldDebounce = typeof config === 'object' && config?.debounce;
                    return shouldDebounce ? timer(500) : of(null);
                }),
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap(() =>
                    filesService
                        .list({ filters: store.filters(), page: store.page(), pageSize: store.pageSize() })
                        .pipe(
                            tapResponse({
                                next: (result) => patchState(store, { items: result.items, totalItems: result.totalItems, loading: false }),
                                error: (error) => {
                                    patchState(store, { loading: false, error: 'Could not load files.' });
                                    console.log(error);
                                }
                            })
                        )
                )
            )
        );

        return {
            loadPage,

            setFilters(filters: FileListFilters): void {
                const searchChanged = filters.search !== store.filters.search();
                patchState(store, { filters, page: 0 });
                loadPage({ debounce: searchChanged });
            },

            setPage(page: number): void {
                patchState(store, { page });
                loadPage();
            },

            upload: rxMethod<{ file: File, metadata: FileMetadataInput }>(
                pipe(
                    tap(() => {
                        patchState(store, { uploading: true, error: null });
                    }),
                    switchMap(({ file, metadata }) =>
                        filesService.upload(file, metadata).pipe(
                            tapResponse({
                                next: () => {
                                    patchState(store, { uploading: false });
                                    loadPage();
                                },
                                error: (error) => {
                                    patchState(store, { uploading: false, error: 'Could not upload file.' });
                                    console.log(error);
                                },
                            }),
                        )
                    ),
                )
            ),

            download(file: FileSummary): void {
                filesService.download(file.id).subscribe((blob) => {
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.download = file.originalFilename;
                    anchor.click();
                    URL.revokeObjectURL(url);
                });
            },

        }

    }),

    withHooks({
        onInit(store) {
            store.loadPage();
        }
    })
);