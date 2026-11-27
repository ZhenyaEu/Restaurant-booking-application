import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
//import { BookingService, TimelineSlot } from '../booking';
import { BookingService, TimelineSlot } from '../../services/booking';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-book-table-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule,
    MatSelectModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Table reservation</h2>

    <mat-dialog-content>
      <div class="restaurant-info">
        <img [src]="data.photoUrl" [alt]="data.name" class="photo" />
        <p>
         You are reserving a table at a restaurant <strong>{{ data.name }}</strong> 
          located at: <span>{{ data.address }}</span>
        </p>
      </div>

      <form [formGroup]="form" class="form-container">
        <!-- 1. Date selection -->
        <mat-form-field appearance="outline">
          <mat-label>Date of visit</mat-label>
          <input matInput [matDatepicker]="picker" [min]="minDate" formControlName="date" readonly (click)="picker.open()">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <!-- 2. Time selection (enabled after selecting a date) -->
        <div class="time-row">
          <!-- Start time -->
          <mat-form-field appearance="outline">
            <mat-label>Start of the visit</mat-label>
            <mat-select formControlName="startTime">
              @for (slot of startSlots; track slot.time) {
                <mat-option [value]="slot" [disabled]="!slot.isAvailableForStart">
                  <div class="option-row">
                    <span>{{ slot.time }}</span>
                    @if (slot.isReserved) {
                      <span class="badge-reserved">reserved</span>
                    } @else if (slot.isPast) {
                      <span class="badge-past">прошло</span>
                    }
                  </div>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <!-- End time (custom duration in 30-minute steps) -->
          <mat-form-field appearance="outline">
            <mat-label>End of the visit</mat-label>
            <mat-select formControlName="endTime">
              @for (slot of availableEndSlots; track slot.time) {
                <mat-option [value]="slot.time">
                  {{ slot.time }} ({{ formatDuration(slot.minutes - form.value.startTime?.minutes) }})
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        @if (errorMessage) {
          <p class="error-text">{{ errorMessage }}</p>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">CANCEL</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || isLoading" (click)="onBook()">
        BOOK
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .restaurant-info { text-align: center; margin-bottom: 16px; }
    .photo { width: 100%; height: 170px; object-fit: cover; border-radius: 8px; }
    .form-container { display: flex; flex-direction: column; gap: 12px; }
    .time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .option-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .badge-reserved { color: #d32f2f; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .badge-past { color: #9e9e9e; font-size: 11px; }
    .error-text { color: #d32f2f; font-size: 13px; margin: 0; }
  `]
})
export class BookTableDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private dialogRef = inject(MatDialogRef<BookTableDialogComponent>);
  private authService = inject(AuthService);

  minDate = new Date(); // Prevent selecting yesterday's date
  timeline: TimelineSlot[] = [];
  availableEndSlots: TimelineSlot[] = [];
  isLoading = false;
  errorMessage = '';

  form: FormGroup = this.fb.group({
    date: [null, Validators.required],
    startTime: [{ value: null, disabled: true }, Validators.required],
    endTime: [{ value: null, disabled: true }, Validators.required]
  });

  // All slots except the final closing point (because a booking cannot start at 22:00/23:00)
  get startSlots(): TimelineSlot[] {
    return this.timeline.slice(0, -1);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    // 1. React to date selection
    this.form.get('date')?.valueChanges.subscribe((date: Date) => {
      if (!date) return;
      this.errorMessage = '';
      this.form.get('startTime')?.reset();
      this.form.get('endTime')?.reset();
      this.form.get('endTime')?.disable();

      const dateStr = this.formatDate(date);
      this.bookingService.getTimeline(this.data.restaurantId, dateStr).subscribe(slots => {
        this.timeline = slots;
        this.form.get('startTime')?.enable(); // Enable the time input after selecting a date
      });
    });

    // 2. React to start-time selection -> calculate the allowed end time
    this.form.get('startTime')?.valueChanges.subscribe((selectedStart: TimelineSlot) => {
      const endControl = this.form.get('endTime');
      endControl?.reset();

      if (!selectedStart) {
        endControl?.disable();
        return;
      }

      this.calculateAvailableEndSlots(selectedStart);
      endControl?.enable();
    });
  }

  private calculateAvailableEndSlots(startSlot: TimelineSlot): void {
    const validEnds: TimelineSlot[] = [];
    const startIndex = this.timeline.findIndex(s => s.minutes === startSlot.minutes);

    // Move forward along the timeline from the selected start in 30-minute steps
    for (let i = startIndex + 1; i < this.timeline.length; i++) {
      const candidateSlot = this.timeline[i];

      // Check whether we have reached the buffer before the next reservation from another user
      // If candidateSlot.isReserved == true, there is already a reservation for that time,
      // so our booking must end at least 30 minutes earlier (at the previous step).
      if (candidateSlot.isReserved) {
        // Remove the last added slot to preserve a 30-minute buffer before another user's reservation
        validEnds.pop();
        break;
      }

      validEnds.push(candidateSlot);
    }

    this.availableEndSlots = validEnds;
  }

  formatDuration(mins: number): string {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? (m > 0 ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onBook(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const { date, startTime, endTime } = this.form.value;
    const user = this.authService.currentUser();

    this.bookingService.createBooking({
      restaurantId: this.data.restaurantId,
      date: this.formatDate(date),
      startTime: startTime.time,
      endTime: endTime,
      customerName: user ? `${user.firstName} ${user.secondName}` : 'Guest',
      customerEmail: ''
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Ошибка при бронировании';
      }
    });
  }
}
