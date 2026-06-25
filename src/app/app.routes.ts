import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { BoutiqueGuard } from './core/guards/boutique.guard';

// Trigger rebuild for liquidation component
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'create-boutique',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/main/create-boutique/create-boutique.component').then(m => m.CreateBoutiqueComponent)
  },
  {
    path: 'main',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/main/tabs/tabs.component').then(m => m.TabsComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [BoutiqueGuard],
        loadComponent: () => import('./features/main/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'caisse',
        canActivate: [BoutiqueGuard],
        loadComponent: () => import('./features/main/caisse/caisse.component').then(m => m.CaisseComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/main/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'catalogue',
        canActivate: [BoutiqueGuard],
        loadComponent: () => import('./features/main/catalogue/catalogue.component').then(m => m.CatalogueComponent)
      },
      {
        path: 'liquidation',
        canActivate: [BoutiqueGuard],
        loadComponent: () => import('./features/main/liquidation/liquidation.component').then(m => m.LiquidationComponent)
      },

      {
        path: 'select-boutique',
        loadComponent: () => import('./features/main/select-boutique/select-boutique.component').then(m => m.SelectBoutiqueComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Add onboarding routes if needed for merchant registration
  {
    path: '**', // Wildcard route for any unmatched URLs
    redirectTo: 'main/dashboard' // Redirect to dashboard if no other route matches
  }
];
