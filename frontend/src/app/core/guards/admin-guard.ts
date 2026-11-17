import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in AND has the 'Admin' role
  if (authService.isAuthenticated() && authService.currentUser()?.role === 'Admin') {
    return true; // Access granted
  }

  // If not an admin, redirect them safely to the home page
  router.navigate(['/']);
  return false; // Access denied
};
