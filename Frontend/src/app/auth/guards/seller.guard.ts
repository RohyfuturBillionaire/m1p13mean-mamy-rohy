import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const sellerGuard: CanActivateFn = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const role = (userData?.user?.role || '').toLowerCase();
    if (role === 'boutique') {
      if (userData?.user?.hasBoutique === false) {
        inject(Router).navigate(['/boutique-pending']);
        return false;
      }
      return true;
    }
  } catch {}
  inject(Router).navigate(['/connexion']);
  return false;
};
