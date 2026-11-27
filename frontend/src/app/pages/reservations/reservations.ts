import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BookingService, Booking } from '../../core/services/booking';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [DatePipe, FormsModule, SpinnerComponent],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss'
})
export class ReservationsComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings = signal<Booking[]>([]);
  selectedDate = signal<string>(''); // Stores 'YYYY-MM-DD' from the date filter
  isLoading = signal<boolean>(true)

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
    this.isLoading.set(true);
    this.bookingService.getWaiterBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load reservations:', err);
        this.isLoading.set(false);
      }
    });
  }

  onDateChange(newDate: string) {
    this.selectedDate.set(newDate);
  }

  clearFilter() {
    this.selectedDate.set('');
  }

  // Generate and download the PDF report
  downloadPdfReport() {
    const data = this.filteredBookings();
    if (data.length === 0) return;

    const doc = new jsPDF();
    const filterDate = this.selectedDate();

    // 1. Document title
    doc.setFontSize(18);
    doc.setTextColor(21, 128, 61); // Brand green color (#15803d)
    doc.text('Georgian Restaurant Chain — Reservations Report', 14, 20);

    // 2. Subtitle with the selected date and total number of bookings
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    const periodText = filterDate ? `Selected Date: ${filterDate}` : 'Period: All Dates';
    doc.text(`${periodText} | Total Reservations: ${data.length}`, 14, 28);

    // 3. Prepare table rows
    const tableRows = data.map((item, index) => [
      index + 1,
      item.customerName,
      item.customerEmail,
      item.date,
      `${item.startTime} - ${item.endTime}`,
      new Date(item.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    ]);

    // 4. Render the table
    autoTable(doc, {
      startY: 35,
      head: [['#', 'Customer Name', 'Email', 'Reserved Date', 'Time Slot', 'Booked On']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [21, 128, 61], // Green table header
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });

    // 5. Save the file with a readable name
    const fileName = filterDate ? `reservations_${filterDate}.pdf` : 'reservations_all.pdf';
    doc.save(fileName);
  }
}
