import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TimelineSlot {
  time: string;
  minutes: number;
  isPast: boolean;
  isReserved: boolean;
  isAvailableForStart: boolean;

}

// 1. New reservation interface for the Waiter
export interface Booking {
  id: string;
  restaurantId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/bookings';

  getTimeline(restaurantId: string, date: string): Observable<TimelineSlot[]> {
    // Pass the user's timezone offset (in minutes) so the server knows the exact local time
    const tzOffset = new Date().getTimezoneOffset();
    return this.http.get<TimelineSlot[]>(`${this.apiUrl}/timeline`, {
      params: { restaurantId, date, tzOffset: tzOffset.toString() }
    });
  }

  createBooking(data: {
    restaurantId: string;
    date: string;
    startTime: string;
    endTime: string;
    customerName?: string;
    customerEmail?: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getWaiterBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/waiter`);
  }
}
