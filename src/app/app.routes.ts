import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthStore } from './core/auth/auth.store';
import { wishlistResolver } from './features/wishlists/data/wishlist-resolver';

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
      (await import('./shell/app-layout/app-layout.component')).AppLayoutComponent,

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
              (await import('./features/wishlists/pages/wishlists/wishlists.page')).WishlistsPage,
            pathMatch: 'full',
            canActivate: [authGuard],
          },
          {
            path: ':id',
            resolve: {
              wishlist: wishlistResolver,
            },
            loadComponent: async () =>
              (await import('./features/wishlists/pages/wishlist-details/wishlist-details.page'))
                .WishlistDetailsPage,
          },
        ],
      },
      {
        path: 'reserved-gifts',
        loadComponent: async () =>
          (await import('./features/reservations/reserved-gifts.page')).ReservedGiftsPage,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
