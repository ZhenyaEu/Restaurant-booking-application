import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const notWaiterGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Проверяем: если текущий пользователь — Waiter, запрещаем переход
  if (authService.currentUser()?.role === 'Waiter') {
    router.navigate(['/orders']); // Перенаправляем на его страницу заказов
    return false;
  }

  // Для всех остальных (Гость, Customer, Admin) доступ разрешен
  return true;
};
