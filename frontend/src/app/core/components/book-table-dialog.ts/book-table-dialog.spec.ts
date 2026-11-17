import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookTableDialogTs } from './book-table-dialog.js';

describe('BookTableDialogTs', () => {
  let component: BookTableDialogTs;
  let fixture: ComponentFixture<BookTableDialogTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookTableDialogTs],
    }).compileComponents();

    fixture = TestBed.createComponent(BookTableDialogTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
