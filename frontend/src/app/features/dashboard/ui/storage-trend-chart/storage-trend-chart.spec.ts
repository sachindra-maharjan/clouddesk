import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageTrendChart } from './storage-trend-chart';

describe('StorageTrendChart', () => {
  let component: StorageTrendChart;
  let fixture: ComponentFixture<StorageTrendChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageTrendChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageTrendChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
