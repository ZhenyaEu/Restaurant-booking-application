import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button';
import { RestaurantsService, Restaurant } from '../../core/services/restaurants';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [ButtonComponent, RouterLink, SpinnerComponent],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.scss'
})
export class RestaurantsComponent implements OnInit {
  private restaurantsService = inject(RestaurantsService);
  restaurants = signal<Restaurant[]>([]);
  isLoading = signal<boolean>(true)

  ngOnInit() {
    this.isLoading.set(true);
    this.restaurantsService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load restaurants', err);
        this.isLoading.set(false);
      }
    });
  }
}
