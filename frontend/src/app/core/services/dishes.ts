import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dish {
  id?: number;
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

  // Получить все блюда (для главной)
  getDishes(): Observable<Dish[]> {
    return this.http.get<Dish[]>(`${this.apiUrl}/dishes`);
  }

  // Отправить новое блюдо как FormData (для админки)
  addDish(formData: FormData): Observable<Dish> {
    return this.http.post<Dish>(`${this.apiUrl}/admin/dishes`, formData);
  }

  // Получить список покупателей для админки
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/admin/customers`);
  }

  // Удалить блюдо по ID
deleteDish(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/dishes/${id}`);
}

// Обновить блюдо по ID
updateDish(id: number, formData: FormData): Observable<Dish> {
  return this.http.put<Dish>(`${this.apiUrl}/admin/dishes/${id}`, formData);
}

}
