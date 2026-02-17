import { Routes } from '@angular/router';
import { SellerLayoutComponent } from './layout/seller-layout.component';
import { sellerGuard } from '../auth/guards/seller.guard';

export const SELLER_ROUTES: Routes = [
  {
    path: '',
    component: SellerLayoutComponent,
    canActivate: [sellerGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent)
      },
      {
        path: 'produits',
        loadComponent: () => import('./produits/produits.component').then(m => m.ProduitsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'stocks',
        loadComponent: () => import('./stocks/stocks.component').then(m => m.StocksComponent)
      },
      {
        path: 'commandes',
        loadComponent: () => import('./commandes/commandes.component').then(m => m.CommandesComponent)
      },
      {
        path: 'livraisons',
        loadComponent: () => import('./livraisons/livraisons.component').then(m => m.LivraisonsComponent)
      },
      {
        path: 'promotions',
        loadComponent: () => import('./promotions/seller-promotions.component').then(m => m.SellerPromotionsComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./profil/profil-boutique.component').then(m => m.ProfilBoutiqueComponent)
      },
      {
        path: 'faq',
        loadComponent: () => import('./faq/faq.component').then(m => m.FaqComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./messages/seller-messages.component').then(m => m.SellerMessagesComponent)
      }
    ]
  }
];
