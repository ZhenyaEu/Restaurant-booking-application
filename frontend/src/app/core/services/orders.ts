import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from './cart';

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  status: 'In progress' | 'Completed';
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  createOrder(): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, {});
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/waiter/orders`);
  }

  completeOrder(orderId: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/waiter/orders/${orderId}/complete`, {});
  }
}
