import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentFilesTable } from './recent-files-table';

describe('RecentFilesTable', () => {
  let component: RecentFilesTable;
  let fixture: ComponentFixture<RecentFilesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentFilesTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentFilesTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
