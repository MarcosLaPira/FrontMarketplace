import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/explore', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },

  { path: 'explore', loadComponent: () => import('./pages/explore/explore.component').then(m => m.ExploreComponent) },

  { path: 'dashboard-influencer',
    loadComponent: () => import('./pages/influencer/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleGuard],
    data: { role: 'Influencer' }
  },

  { path: 'dashboard-marca',
    loadComponent: () => import('./pages/marca/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleGuard],
    data: { role: 'Marca' }
  },

  { path: 'unauthorized', loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },

  { path: '**', redirectTo: '/explore' }
];

