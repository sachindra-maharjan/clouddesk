import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { DashboardStore } from './dashboard.store';
import { Dashboard } from './dashboard';
import { Files } from '../../files/data-access/files';
import { ActivitySocket, ActivityMessage } from '../../../core/services/activity-socket.service';
import { FilePage } from '../../files/files.models';

function fakeFilePage(): FilePage {
  return { items: [], page: 0, pageSize: 5, totalItems: 0 };
}

function fakeActivityEvent(overrides: Record<string, unknown> = {}) {
  return {
    displayName: 'report.pdf',
    ownerName: 'Maria',
    category: 'DOCUMENT',
    sizeBytes: 512,
    uploadedAt: '2026-07-27T09:00:00Z',
    ...overrides,
  };
}

describe('DashboardStore', () => {
  let dashboardMock: { getSummary: ReturnType<typeof vi.fn>; getStorageTrend: ReturnType<typeof vi.fn> };
  let filesMock: { list: ReturnType<typeof vi.fn> };
  let activitySocketMock: { connect: ReturnType<typeof vi.fn> };
  let activitySubject: Subject<ActivityMessage>;

  beforeEach(() => {
    activitySubject = new Subject<ActivityMessage>();
    dashboardMock = {
      getSummary: vi.fn().mockReturnValue(of({ totalFiles: 10, totalStorageBytes: 1024, activeUsers: 3, filesUploadedThisWeek: 2 })),
      getStorageTrend: vi.fn().mockReturnValue(of([{ date: '2026-07-27', cumulativeBytes: 1024 }])),
    };
    filesMock = { list: vi.fn().mockReturnValue(of(fakeFilePage())) };
    activitySocketMock = { connect: vi.fn().mockReturnValue(activitySubject.asObservable()) };

    TestBed.configureTestingModule({
      providers: [
        { provide: Dashboard, useValue: dashboardMock },
        { provide: Files, useValue: filesMock },
        { provide: ActivitySocket, useValue: activitySocketMock },
      ],
    });
  });

  it('starts with loading true and empty data before responses arrive', () => {
    dashboardMock.getSummary.mockReturnValue(NEVER);
    dashboardMock.getStorageTrend.mockReturnValue(NEVER);
    filesMock.list.mockReturnValue(NEVER);

    const store = TestBed.inject(DashboardStore);

    expect(store.loading()).toBe(true);
    expect(store.summary()).toBeNull();
    expect(store.storageTrend()).toEqual([]);
    expect(store.recentFiles()).toEqual([]);
    expect(store.liveFeed()).toEqual([]);
    expect(store.error()).toBeNull();
  });

  it('loads dashboard summary and storage trend on init', () => {
    TestBed.inject(DashboardStore);

    expect(dashboardMock.getSummary).toHaveBeenCalled();
    expect(dashboardMock.getStorageTrend).toHaveBeenCalledWith(30);
  });

  it('loads recent files on init', () => {
    TestBed.inject(DashboardStore);

    expect(filesMock.list).toHaveBeenCalled();
  });

  it('connects to activity socket on init', () => {
    TestBed.inject(DashboardStore);

    expect(activitySocketMock.connect).toHaveBeenCalled();
  });

  it('prepends FILE_UPLOADED events to liveFeed', () => {
    const store = TestBed.inject(DashboardStore);
    const event1 = fakeActivityEvent({ displayName: 'first.pdf' });
    const event2 = fakeActivityEvent({ displayName: 'second.pdf' });

    activitySubject.next({ type: 'FILE_UPLOADED', payload: event1 });
    expect(store.liveFeed().length).toBe(1);
    expect(store.liveFeed()[0].displayName).toBe('first.pdf');

    activitySubject.next({ type: 'FILE_UPLOADED', payload: event2 });
    expect(store.liveFeed().length).toBe(2);
    expect(store.liveFeed()[0].displayName).toBe('second.pdf');
    expect(store.liveFeed()[1].displayName).toBe('first.pdf');
  });

  it('ignores non-FILE_UPLOADED messages', () => {
    const store = TestBed.inject(DashboardStore);

    activitySubject.next({ type: 'USER_JOINED', payload: {} });
    activitySubject.next({ type: 'FILE_DELETED', payload: {} });

    expect(store.liveFeed()).toEqual([]);
  });

  it('caps liveFeed at 15 entries', () => {
    const store = TestBed.inject(DashboardStore);

    for (let i = 0; i < 20; i++) {
      activitySubject.next({
        type: 'FILE_UPLOADED',
        payload: fakeActivityEvent({ displayName: `file-${i}.pdf` }),
      });
    }

    expect(store.liveFeed().length).toBe(15);
    expect(store.liveFeed()[0].displayName).toBe('file-19.pdf');
    expect(store.liveFeed()[14].displayName).toBe('file-5.pdf');
  });

  it('sets loading to true while dashboard loads', () => {
    dashboardMock.getSummary.mockReturnValue(NEVER);
    dashboardMock.getStorageTrend.mockReturnValue(NEVER);

    const store = TestBed.inject(DashboardStore);

    expect(store.loading()).toBe(true);
  });

  it('sets error on dashboard load failure', () => {
    dashboardMock.getSummary.mockReturnValue(throwError(() => new Error('fail')));
    dashboardMock.getStorageTrend.mockReturnValue(of([]));

    const store = TestBed.inject(DashboardStore);

    expect(store.error()).toBe('Could not load dashboard');
    expect(store.loading()).toBe(false);
  });

  it('sets error on recent files load failure', () => {
    filesMock.list.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(DashboardStore);

    expect(store.error()).toBe('Could not load recent files.');
  });

  it('setRecentFilesSort toggles sort direction when same field', () => {
    const store = TestBed.inject(DashboardStore);

    store.setRecentFilesSort('DISPLAY_NAME');
    expect(store.recentFilesSortBy()).toBe('DISPLAY_NAME');
    expect(store.recentFilesSortDir()).toBe('DESC');

    store.setRecentFilesSort('DISPLAY_NAME');
    expect(store.recentFilesSortDir()).toBe('ASC');

    store.setRecentFilesSort('DISPLAY_NAME');
    expect(store.recentFilesSortDir()).toBe('DESC');
  });

  it('setRecentFilesSort resets to DESC when switching fields', () => {
    const store = TestBed.inject(DashboardStore);

    store.setRecentFilesSort('DISPLAY_NAME');
    store.setRecentFilesSort('DISPLAY_NAME');
    expect(store.recentFilesSortDir()).toBe('ASC');

    store.setRecentFilesSort('SIZE_BYTES');
    expect(store.recentFilesSortBy()).toBe('SIZE_BYTES');
    expect(store.recentFilesSortDir()).toBe('DESC');
  });
});
