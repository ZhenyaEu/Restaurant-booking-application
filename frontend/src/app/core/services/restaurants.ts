import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



export interface Restaurant {
  id: number;
  name: string;
  address: string;
  imageUrl: string;
  cuisine?: string;
  workingHours?: string;
  interiorDescription?: string;
  locationDescription?: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId?: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/restaurants';

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  getRestaurantById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  saveReview(restaurantId: number, data: { rating: number; comment: string }): Observable<Review> {
  return this.http.post<Review>(`${this.apiUrl}/${restaurantId}/reviews`, data);
}
}
