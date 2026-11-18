import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface BookingSuccessData {
  restaurantName: string;
  date: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-booking-success-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="success-modal">
      <div class="check-icon">✓</div>
      <h2>Table successfully reserved!</h2>
      <p class="restaurant-name">{{ data.restaurantName }}</p>
      <div class="booking-details">
        <span>📅 Date: <b>{{ data.date }}</b></span>
        <span>🕒 Time: <b>{{ data.startTime }} – {{ data.endTime }}</b></span>
      </div>
    </div>
  `,
  styleUrl: './booking-success-dialog.scss'
})
export class BookingSuccessDialogComponent {
  public data: BookingSuccessData = inject(MAT_DIALOG_DATA);
}
