import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button';
import { RestaurantsService, Restaurant } from '../../core/services/restaurants';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.scss'
})
export class RestaurantsComponent implements OnInit {
  private restaurantsService = inject(RestaurantsService);
  restaurants = signal<Restaurant[]>([]);

  ngOnInit() {
    this.restaurantsService.getRestaurants().subscribe({
      next: (data) => this.restaurants.set(data),
      error: (err) => console.error('Failed to load restaurants', err)
    });
  }
}
