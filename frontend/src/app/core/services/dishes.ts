import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dish {
  id?: any;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface Customer {
  id: number;
  firstName: string;
  secondName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class DishesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Get all dishes (for the home page)
  getDishes(): Observable<Dish[]> {
    return this.http.get<Dish[]>(`${this.apiUrl}/dishes`);
  }

  // Submit a new dish as FormData (for the admin panel)
  addDish(formData: FormData): Observable<Dish> {
    return this.http.post<Dish>(`${this.apiUrl}/admin/dishes`, formData);
  }

  // Get the customer list for the admin panel
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/admin/customers`);
  }

  // Delete a dish by ID
deleteDish(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/dishes/${id}`);
}

// Update a dish by ID
updateDish(id: number, formData: FormData): Observable<Dish> {
  return this.http.put<Dish>(`${this.apiUrl}/admin/dishes/${id}`, formData);
}

}
