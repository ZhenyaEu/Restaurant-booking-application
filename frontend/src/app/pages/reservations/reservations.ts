import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Booking } from '../../core/services/booking';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss'
})
export class ReservationsComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings = signal<Booking[]>([]);
  selectedDate = signal<string>(''); // Stores 'YYYY-MM-DD' from the date filter

  // Automatically filters by selectedDate (if chosen) and sorts chronologically by time
  filteredBookings = computed(() => {
    const dateFilter = this.selectedDate();
    let list = this.bookings();

    if (dateFilter) {
      list = list.filter(b => b.date === dateFilter);
    }

    // Sort by reservation date & startTime ascending
    return [...list].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  });

  ngOnInit() {
    this.bookingService.getWaiterBookings().subscribe({
      next: (data) => this.bookings.set(data),
      error: (err) => console.error('Failed to load reservations:', err)
    });
  }

  onDateChange(newDate: string) {
    this.selectedDate.set(newDate);
  }

  clearFilter() {
    this.selectedDate.set('');
  }
}
