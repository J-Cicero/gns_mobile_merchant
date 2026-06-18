import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'main/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'main',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/main/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'caisse',
        loadComponent: () => import('./features/main/caisse/caisse.component').then(m => m.CaisseComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/main/profile/profile.component').then(m => m.ProfileComponent)
      },
      // Add other main merchant routes here as needed
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
