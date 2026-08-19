import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { FileSortField, FileSummary, SortDirection } from "../../files/files.models";
import { ActivityEvent, DashboardSummary, StorageTrendPoint } from "../dashboard.models";

import { Dashboard } from "./dashboard";
import { inject } from "@angular/core";
import { Files } from "../../files/data-access/files";
import { ActivitySocket } from "../../../core/services/activity-socket.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { forkJoin, pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";


const MAX_LIVE_FEED_ENTRIES = 15;
const RECENT_FILES_PAGE_SIZE = 5;

interface DashboardState {
    summary: DashboardSummary | null;
    storageTrend: StorageTrendPoint[];
    recentFiles: FileSummary[];
    recentFilesSortBy: FileSortField;
    recentFilesSortDir: SortDirection;
    liveFeed: ActivityEvent[];
    loading: boolean;
    error: string | null;
}
const initialState: DashboardState = {
    summary: null,
    storageTrend: [],
    recentFiles: [],
    recentFilesSortBy: 'UPLOADED_AT',
    recentFilesSortDir: 'DESC',
    liveFeed: [],
    loading: false,
    error: null,
}

export const DashboardStore = signalStore(
    { providedIn: 'root' },

    withState(initialState),

    withMethods((store, fileService = inject(Files), dashboardService = inject(Dashboard), activitySocket = inject(ActivitySocket)) => {
        const loadRecentFiles = rxMethod<void>(
            pipe(
                switchMap(() => fileService.list({
                    filters: { search: '', category: 'ALL' },
                    page: 0,
                    pageSize: RECENT_FILES_PAGE_SIZE,
                    sortBy: store.recentFilesSortBy(),
                    sortDir: store.recentFilesSortDir(),
                })),
                tapResponse({
                    next: (page) => patchState(store, { recentFiles: page.items }),
                    error: () => patchState(store, { error: 'Could not load recent files.' }),
                })
            )
        )

        const loadDashboard = rxMethod<void>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap(() =>
                    forkJoin({
                        summary: dashboardService.getSummary(),
                        storageTrend: dashboardService.getStorageTrend(30)
                    }).pipe(
                        tapResponse({
                            next: ({ summary, storageTrend }) => patchState(store, { summary, storageTrend, loading: false }),
                            error: () => patchState(store, { loading: false, error: 'Could not load dashboard' }),
                        })

                    )
                )
            )
        )

        const setRecentFilesSort = (sortBy: FileSortField): void => {
            const sortDir: SortDirection = store.recentFilesSortBy() === sortBy && store.recentFilesSortDir() === 'DESC' ? 'ASC' : 'DESC';
            patchState(store, { recentFilesSortBy: sortBy, recentFilesSortDir: sortDir });
            loadRecentFiles();
        }

        const listenForActivity = rxMethod<void>(
            pipe(
                switchMap(() => activitySocket.connect()),
                tap((message) => {
                    if (message.type === 'FILE_UPLOADED') {
                        const event = message.payload as ActivityEvent;
                        patchState(store, { liveFeed: [event, ...store.liveFeed()].slice(0, MAX_LIVE_FEED_ENTRIES) });
                    }
                }),
            )
        )


        return {
            loadDashboard,
            loadRecentFiles,
            setRecentFilesSort,
            listenForActivity,
        };
    }

    ),
    withHooks({
        onInit(store): void {
            store.loadDashboard();
            store.loadRecentFiles();
            store.listenForActivity();
        }
    }
    ),

);