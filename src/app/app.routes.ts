import { Routes } from '@angular/router';

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
