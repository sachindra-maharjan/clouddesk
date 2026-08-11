import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FilePage } from './file-page';

describe('FilePage', () => {
  let component: FilePage;
  let fixture: ComponentFixture<FilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
