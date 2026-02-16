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
        path: 'contrats',
        loadComponent: () => import('./boutiques/boutiques.component').then(m => m.BoutiquesAdminComponent)
      },
      {
        path: 'types-contrat',
        loadComponent: () => import('./types-contrat/types-contrat.component').then(m => m.TypesContratComponent)
      },
      {
        path: 'gestion-boutiques',
        loadComponent: () => import('./gestion-boutiques/gestion-boutiques.component').then(m => m.GestionBoutiquesComponent)
      },
      {
        path: 'plan-centre',
        loadComponent: () => import('./plan-centre/plan-centre.component').then(m => m.PlanCentreComponent)
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
