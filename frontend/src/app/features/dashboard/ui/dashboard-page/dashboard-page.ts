import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StatWidget } from "../stat-widget/stat-widget";
import { StorageTrendChart } from '../storage-trend-chart/storage-trend-chart';
import { LiveFeed } from '../live-feed/live-feed';
import { RecentFilesTable } from '../recent-files-table/recent-files-table';
import { FileSortField, SortDirection } from '../../../files/files.models';
import { DashboardStore } from '../../data-access/dashboard.store';
import { AuthStore } from '../../../auth/data-access/auth.store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  imports: [StatWidget, StorageTrendChart, LiveFeed, RecentFilesTable, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {

  protected readonly dashboardStore = inject(DashboardStore);
  protected readonly authStore = inject(AuthStore);

  readonly recentFilesSoryBy = signal<FileSortField>('UPLOADED_AT');
  readonly recentFilesSortDir = signal<SortDirection>('DESC');

  handleSortChange(field: FileSortField): void {
    this.recentFilesSoryBy.set(field);
  }

}
