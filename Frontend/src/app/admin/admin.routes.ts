import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent)
      },
      {
        path: 'boutiques',
        loadComponent: () => import('./boutiques/boutiques.component').then(m => m.BoutiquesAdminComponent)
      },
      {
        path: 'promotions',
        loadComponent: () => import('./promotions/promotions-admin.component').then(m => m.PromotionsAdminComponent)
      },
      {
        path: 'loyers',
        loadComponent: () => import('./loyers/loyers.component').then(m => m.LoyersComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'parametres',
        loadComponent: () => import('./parametres/parametres.component').then(m => m.ParametresComponent)
      }
    ]
  }
];
