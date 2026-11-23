import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { CartService } from './cart';

export interface AuthResponse {
  token: string;
  user: {
    id?: string
    firstName: string;
    secondName: string;
    role: 'Admin' | 'Customer' | 'Waiter';
    email?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api';

  // Сигналы для отслеживания состояния пользователя во всем приложении
  currentUser = signal<AuthResponse['user'] | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);

      // 3. Если при перезагрузке страницы это Customer, подгружаем его корзину
      if (user.role === 'Customer') {
        this.cartService.loadCart();
      }
    }
  }

  register(data: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  login(data: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.cartService.clearLocalCart();
    this.router.navigate(['/']); // При выходе возвращаем на главную
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);

    if (res.user.role === 'Customer') {
      this.cartService.loadCart();
    } else if (res.user.role === 'Waiter') {
      // Автоматический редирект официанта на страницу /orders
      this.router.navigate(['/orders']);
    } else if (res.user.role === 'Admin') {
      // Автоматический переход на Admin Panel при входе админа
      this.router.navigate(['/admin']);
    }
  }

  

updateProfile(data: { firstName: string; secondName: string }) {
  return this.http.put<AuthResponse['user']>(`${this.apiUrl}/customer/profile`, data).pipe(
    tap(updatedUser => {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.currentUser.set(updatedUser);
    })
  );
}

deleteAccount() {
  return this.http.delete(`${this.apiUrl}/customer/profile`).pipe(
    tap(() => this.logout())
  );
}

getCustomerHistory() {
  return this.http.get<{ orders: any[]; bookings: any[] }>(`${this.apiUrl}/customer/history`);
}

}
