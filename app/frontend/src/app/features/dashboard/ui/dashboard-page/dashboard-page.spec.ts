import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NEVER } from 'rxjs';
import { DashboardPage } from './dashboard-page';
import { Dashboard } from '../../data-access/dashboard';
import { Files } from '../../../files/data-access/files';
import { ActivitySocket } from '../../../../core/services/activity-socket.service';
import { AuthStore } from '../../../auth/data-access/auth.store';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let authStoreMock: { logout: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authStoreMock = { logout: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        { provide: Dashboard, useValue: { getSummary: vi.fn().mockReturnValue(NEVER), getStorageTrend: vi.fn().mockReturnValue(NEVER) } },
        { provide: Files, useValue: { list: vi.fn().mockReturnValue(NEVER) } },
        { provide: ActivitySocket, useValue: { connect: vi.fn().mockReturnValue(NEVER) } },
        { provide: AuthStore, useValue: authStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the live-feed component', () => {
    fixture.detectChanges();

    const liveFeedEl = fixture.nativeElement.querySelector('app-live-feed');
    expect(liveFeedEl).toBeTruthy();
  });

  it('renders the storage trend chart', () => {
    fixture.detectChanges();

    const chartEl = fixture.nativeElement.querySelector('app-storage-trend-chart');
    expect(chartEl).toBeTruthy();
  });

  it('renders the recent files table', () => {
    fixture.detectChanges();

    const tableEl = fixture.nativeElement.querySelector('app-recent-files-table');
    expect(tableEl).toBeTruthy();
  });

  it('displays the dashboard title', () => {
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading.textContent).toContain('Dashboard');
  });

  it('calls authStore.logout when sign out is clicked', () => {
    fixture.detectChanges();

    const signOutBtn = fixture.nativeElement.querySelector('button');
    signOutBtn.click();

    expect(authStoreMock.logout).toHaveBeenCalled();
  });

  it('shows loading state while dashboard loads', () => {
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('.text-slate-light');
    expect(loadingEl?.textContent).toContain('Loading content');
  });
});
