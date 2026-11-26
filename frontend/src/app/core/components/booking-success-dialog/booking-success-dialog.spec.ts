import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSuccessDialogComponent } from './booking-success-dialog';

describe('BookingSuccessDialog', () => {
  let component: BookingSuccessDialogComponent;
  let fixture: ComponentFixture<BookingSuccessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSuccessDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingSuccessDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
