import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FileList } from './file-list';

describe('FileList', () => {
  let component: FileList;
  let fixture: ComponentFixture<FileList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
