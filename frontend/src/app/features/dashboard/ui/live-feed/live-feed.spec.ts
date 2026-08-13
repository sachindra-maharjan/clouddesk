import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { LiveFeed } from './live-feed';
import { ActivityEvent } from '../../dashboard.models';

describe('LiveFeed', () => {
  let component: LiveFeed;
  let fixture: ComponentFixture<LiveFeed>;

  function createEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
    return {
      displayName: 'Q3 board deck',
      ownerName: 'Maria Alvarez',
      category: 'PRESENTATION',
      sizeBytes: 1024,
      uploadedAt: '2026-07-27T09:00:00Z',
      ...overrides,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveFeed],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveFeed);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('events', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows empty state message when events array is empty', () => {
    fixture.componentRef.setInput('events', []);
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('.text-center');
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent).toContain('No activity yet');
  });

  it('renders event rows when events are provided', () => {
    const events = [
      createEvent({ displayName: 'report.pdf', ownerName: 'Alice' }),
      createEvent({ displayName: 'slides.pptx', ownerName: 'Bob' }),
    ];
    fixture.componentRef.setInput('events', events);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.telemetry-row');
    expect(rows.length).toBe(2);
  });

  it('displays owner name and file name for each event', () => {
    const events = [createEvent({ displayName: 'annual-report.pdf', ownerName: 'Carlos Mendez' })];
    fixture.componentRef.setInput('events', events);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('.telemetry-row');
    expect(row.textContent).toContain('Carlos Mendez');
    expect(row.textContent).toContain('annual-report.pdf');
  });

  it('formats uploadedAt as HH:mm:ss using local timezone', () => {
    const events = [createEvent({ uploadedAt: '2026-07-27T14:35:09Z' })];
    fixture.componentRef.setInput('events', events);
    fixture.detectChanges();

    const timeEl = fixture.nativeElement.querySelector('.font-mono');
    const formatted = timeEl.textContent.trim();
    expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('does not show empty state when events exist', () => {
    fixture.componentRef.setInput('events', [createEvent()]);
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('.text-center');
    expect(emptyEl).toBeNull();
  });
});
