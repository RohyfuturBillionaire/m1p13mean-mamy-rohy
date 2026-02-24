import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

export const AuthGuard: CanActivateFn = () => {
    const router = inject(Router);
  try {
    const authService = inject(AuthService);
    console.log('AuthGuard: Checking authentication and role...',authService.getUserRole());
    if (authService.isAuthenticated() && authService.getUserRole()==='') {
        return true;
    }
  } catch (error) {
    console.error('AuthGuard error:', error);
  }
  router.navigate(['/connexion']);
  return false;
};
