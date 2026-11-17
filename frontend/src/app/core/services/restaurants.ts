import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

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
}
