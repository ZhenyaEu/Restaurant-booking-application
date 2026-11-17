import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantsService, Restaurant } from '../../core/services/restaurants';
import { ButtonComponent } from '../../shared/components/button/button';
import { MatDialog } from '@angular/material/dialog';
import { BookTableDialogComponent } from '../../core/components/book-table-dialog.ts/book-table-dialog';

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

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Здесь можно показать уведомление (MatSnackBar): "Столик успешно забронирован!"
    }
  });
}
}
