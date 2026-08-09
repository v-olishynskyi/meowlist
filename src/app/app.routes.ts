import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthStore } from './core/auth.store';

const authGuard = async () => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const isAuthenticated = authStore.isAuthenticated();

  if (!isAuthenticated) {
    return router.createUrlTree(['/']);
  }
  return true;
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: async () =>
      (await import('./layouts/app-layout/app-layout.component')).AppLayoutComponent,

    children: [
      {
        path: '',
        loadComponent: async () => (await import('./features/home/home.page')).HomePage,
        pathMatch: 'full',
      },
      {
        path: 'wishlists',
        children: [
          {
            path: '',
            loadComponent: async () =>
              (await import('./features/wishlists/wishlists.page')).WishlistsPage,
            pathMatch: 'full',
            canActivate: [authGuard],
          },
          {
            path: ':id',
            loadComponent: async () =>
              (await import('./features/wishlist-details/wishlist-details.page'))
                .WishlistDetailsPage,
          },
        ],
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
