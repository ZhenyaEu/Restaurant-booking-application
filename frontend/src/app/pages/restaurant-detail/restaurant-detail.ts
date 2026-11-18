import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantsService, Restaurant } from '../../core/services/restaurants';
import { ButtonComponent } from '../../shared/components/button/button';
import { MatDialog } from '@angular/material/dialog';
import { BookTableDialogComponent } from '../../core/components/book-table-dialog.ts/book-table-dialog';
import { AuthService } from '../../core/services/auth';
import { RegisterDialogComponent } from '../../core/components/register-dialog/register-dialog';
import { BookingSuccessDialogComponent } from '../../core/components/booking-success-dialog/booking-success-dialog';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './restaurant-detail.html',
  styleUrl: './restaurant-detail.scss'
})
export class RestaurantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private restaurantsService = inject(RestaurantsService);
  public authService = inject(AuthService);
  private dialog = inject(MatDialog);

  restaurant = signal<Restaurant | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.restaurantsService.getRestaurantById(id).subscribe({
        next: (data) => this.restaurant.set(data),
        error: (err) => console.error('Error loading restaurant details', err)
      });
    }
  }

  onBookTable() {
  // 1. Если пользователь не зарегистрирован — открываем Sign Up и ждем его закрытия
  if (!this.authService.isAuthenticated()) {
    const registerDialogRef = this.dialog.open(RegisterDialogComponent);

    registerDialogRef.afterClosed().subscribe(() => {
      // Проверяем: если после закрытия окна пользователь успешно зарегистрировался как Customer,
      // сразу открываем окно бронирования столика!
      if (this.authService.isAuthenticated() && this.authService.currentUser()?.role === 'Customer') {
        const restaurant = this.restaurant();
        if (restaurant) this.openBookingModal(restaurant);
      }
    });
    return;
  }

  // 2. Если пользователь уже вошел как Customer — сразу открываем бронирование
  if (this.authService.currentUser()?.role === 'Customer') {
    const restaurant = this.restaurant();
    if (restaurant) this.openBookingModal(restaurant);
  }
}

  openBookingModal(restaurant: any): void {
    const dialogRef = this.dialog.open(BookTableDialogComponent, {
      width: '450px',
      data: {
        restaurantId: restaurant.id || restaurant._id || '1',
        name: restaurant.name,
        address: restaurant.address,
        photoUrl: restaurant.photoUrl
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const successDialogRef = this.dialog.open(BookingSuccessDialogComponent, {
          data: {
            restaurantName: this.restaurant()?.name,
            date: res.date || res.booking?.date,
            startTime: res.startTime || res.booking?.startTime,
            endTime: res.endTime || res.booking?.endTime
          }
        });

        setTimeout(() => {
          successDialogRef.close();
        }, 3000);
      }
    });
  }
}
