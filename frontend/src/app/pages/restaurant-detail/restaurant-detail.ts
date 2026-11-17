import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantsService, Restaurant } from '../../core/services/restaurants';
import { ButtonComponent } from '../../shared/components/button/button';

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
}
