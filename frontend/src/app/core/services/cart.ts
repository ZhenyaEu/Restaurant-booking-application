import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dish } from './dishes';

export interface CartItem {
  dish: Dish;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/cart';

  items = signal<CartItem[]>([]);
  isOpen = signal<boolean>(false);

  totalCount = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this.items().reduce((acc, item) => acc + (item.dish.price * item.quantity), 0)
  );

  // Load the personal cart from the server
  loadCart() {
    this.http.get<CartItem[]>(this.apiUrl).subscribe({
      next: (serverItems) => this.items.set(serverItems),
      error: (err) => console.error('Ошибка загрузки корзины:', err)
    });
  }

  // Clear the cart in frontend memory when logging out
  clearLocalCart() {
    this.items.set([]);
    this.isOpen.set(false);
  }

  // Send the current cart state to the backend
  private syncWithServer(updatedItems: CartItem[]) {
    this.items.set(updatedItems);
    this.http.post<CartItem[]>(this.apiUrl, { items: updatedItems }).subscribe({
      error: (err) => console.error('Ошибка сохранения корзины:', err)
    });
  }

  toggleCart() {
    this.isOpen.update(val => !val);
  }

  closeCart() {
    this.isOpen.set(false);
  }

  addToCart(dish: Dish) {
    const currentItems = this.items();
    const existingIndex = currentItems.findIndex(i => i.dish.id === dish.id);
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = [...currentItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1
      };
    } else {
      updated = [...currentItems, { dish, quantity: 1 }];
    }

    this.syncWithServer(updated);
  }

  updateQuantity(dishId: number | undefined, delta: number) {
    if (!dishId) return;

    const updated = this.items()
      .map(item => item.dish.id === dishId ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0);

    this.syncWithServer(updated);
  }

  removeFromCart(dishId: string | number | undefined) {
    if (!dishId) return;

    const updated = this.items().filter(item => item.dish.id !== dishId);
    this.syncWithServer(updated);
  }

}
