import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const notWaiterGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check: if the current user is a Waiter, prohibit navigation
  if (authService.currentUser()?.role === 'Waiter') {
    router.navigate(['/orders']); // Redirect to the Waiter's orders page
    return false;
  }

  // Access is allowed for all others (Guest, Customer, Admin)
  return true;
};
