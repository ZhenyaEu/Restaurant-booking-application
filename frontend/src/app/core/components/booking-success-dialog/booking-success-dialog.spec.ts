import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSuccessDialog } from './booking-success-dialog';

describe('BookingSuccessDialog', () => {
  let component: BookingSuccessDialog;
  let fixture: ComponentFixture<BookingSuccessDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSuccessDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingSuccessDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
