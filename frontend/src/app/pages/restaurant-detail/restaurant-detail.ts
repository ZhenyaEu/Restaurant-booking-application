import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantsService, Restaurant, Review } from '../../core/services/restaurants';
import { ButtonComponent } from '../../shared/components/button/button';
import { MatDialog } from '@angular/material/dialog';
import { BookTableDialogComponent } from '../../core/components/book-table-dialog.ts/book-table-dialog';
import { AuthService } from '../../core/services/auth';
import { RegisterDialogComponent } from '../../core/components/register-dialog/register-dialog';
import { BookingSuccessDialogComponent } from '../../core/components/booking-success-dialog/booking-success-dialog';
import { ReviewDialogComponent } from '../../core/components/review-dialog/review-dialog';

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

  // Find the current authenticated Customer's review if they already left one
  myReview = computed<Review | undefined>(() => {
    const user = this.authService.currentUser();
    const rest = this.restaurant();
    if (!user || !rest?.reviews) return undefined;

    // Compare by userId
    
    return rest.reviews.find(r => (user.id && r.userId === user.id) );
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.restaurantsService.getRestaurantById(id).subscribe({
        next: (data) => this.restaurant.set(data),
        error: (err) => console.error('Error loading restaurant details', err)
      });
    }
  }

  onOpenReviewDialog() {
    const rest = this.restaurant();
    if (!rest) return;

    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      data: {
        restaurantId: rest.id,
        restaurantName: rest.name,
        existingReview: this.myReview()
      }
    });

    dialogRef.afterClosed().subscribe((savedReview: Review | undefined) => {
      if (savedReview) {
        // Update the on-screen review list without reloading the page
        this.restaurant.update(current => {
          if (!current) return null;
          const existingList = current.reviews || [];
          const index = existingList.findIndex(r => r.id === savedReview.id);

          let updatedReviews: Review[];
          if (index > -1) {
            updatedReviews = [...existingList];
            updatedReviews[index] = savedReview;
          } else {
            updatedReviews = [...existingList, savedReview];
          }

          return { ...current, reviews: updatedReviews };
        });
      }
    });
  }

  onBookTable() {
  // 1. If the user is not registered, open Sign Up and wait for it to close
  if (!this.authService.isAuthenticated()) {
    const registerDialogRef = this.dialog.open(RegisterDialogComponent);

    registerDialogRef.afterClosed().subscribe(() => {
      // Check whether the user successfully registered as a Customer after closing the dialog,
      // and immediately open the table-booking dialog
      if (this.authService.isAuthenticated() && this.authService.currentUser()?.role === 'Customer') {
        const restaurant = this.restaurant();
        if (restaurant) this.openBookingModal(restaurant);
      }
    });
    return;
  }

  // 2. If the user is already logged in as a Customer, open booking immediately
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
