import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { StatWidget } from "../stat-widget/stat-widget";
import { StorageTrendChart } from '../storage-trend-chart/storage-trend-chart';
import { LiveFeed } from '../live-feed/live-feed';
import { RecentFilesTable } from '../recent-files-table/recent-files-table';
import { ActivityEvent, DashboardSummary, StorageTrendPoint } from '../../dashboard.models';
import { FileSortField, FileSummary, SortDirection } from '../../../files/files.models';

const MOCK_SUMMARY: DashboardSummary = {
  totalFiles: 4812, totalStorageBytes: 137_856_204_800, activeUsers: 5, filesUploadedThisWeek: 27,
};

const MOCK_TREND: StorageTrendPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-07-${String(i + 1).padStart(2, '0')}`,
  cumulativeBytes: 80_000_000_000 + i * 1_900_000_000,
}));

const MOCK_RECENT_FILES: FileSummary[] = [
  {
    id: '1', displayName: 'q3-forecast.xlsx', originalFilename: 'q3-forecast.xlsx',
    category: 'SPREADSHEET', visibility: 'TEAM', tags: [], notes: '',
    ownerName: 'R. Chen', sizeBytes: 2_400_000, uploadedAt: '2026-07-27T09:38:00Z',
  },
];

@Component({
  selector: 'app-dashboard-page',
  imports: [StatWidget, StorageTrendChart, LiveFeed, RecentFilesTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnDestroy {

  readonly summary = signal<DashboardSummary>(MOCK_SUMMARY);
  readonly storageTrend = signal<StorageTrendPoint[]>(MOCK_TREND);
  readonly recentFiles = signal<FileSummary[]>(MOCK_RECENT_FILES);
  readonly recentFilesSoryBy = signal<FileSortField>('UPLOADED_AT');
  readonly recentFilesSortDir = signal<SortDirection>('DESC');
  readonly liveFeed = signal<ActivityEvent[]>([]);

  private readonly intervalId = setInterval(() => this.pushFakeEvent(), 4000);

  handleSortChange(field: FileSortField): void {
    this.recentFilesSoryBy.set(field);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  recentFilesSortBy(): FileSortField {
    return 'DESC' as FileSortField;
  }

  private pushFakeEvent(): void {
    const event: ActivityEvent = {
      displayName: 'forecast.xlsx', ownerName: 'R. Chen', category: 'SPREADSHEET',
      sizeBytes: 2_400_000, uploadedAt: new Date().toISOString(),
    };
    this.liveFeed.update((events) => [event, ...events].slice(0, 15));
  }

}
