import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'boutiques',
    loadComponent: () => import('./pages/boutiques/boutiques.component').then(m => m.BoutiquesComponent)
  },
  {
    path: 'boutique/:id',
    loadComponent: () => import('./pages/boutique-detail/boutique-detail.component').then(m => m.BoutiqueDetailComponent)
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map.component').then(m => m.MapComponent)
  },
  {
    path: 'promotions',
    loadComponent: () => import('./pages/promotions/promotions.component').then(m => m.PromotionsComponent)
  },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'login',
    redirectTo: 'connexion',
    pathMatch: 'full'
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'boutique-pending',
    loadComponent: () => import('./pages/boutique-pending/boutique-pending.component').then(m => m.BoutiquePendingComponent)
  },
  {
    path: 'mes-favoris',
    loadComponent: () => import('./pages/mes-favoris/mes-favoris.component').then(m => m.MesFavorisComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'facture',
    loadComponent: () => import('./pages/invoice/invoice.component').then(m => m.InvoiceComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'seller',
    loadChildren: () => import('./seller/seller.routes').then(m => m.SELLER_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
