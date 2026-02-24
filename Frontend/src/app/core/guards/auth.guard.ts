import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

export const AuthGuard: CanActivateFn = () => {
    const router = inject(Router);
  try {
    const authService = inject(AuthService);
    if (authService.IsLoggin()) {
        return true;
    }
  } catch {}
  router.navigate(['/connexion']);
  return false;
};
