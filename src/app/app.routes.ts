import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: async () =>
      (await import('./layouts/app-layout/app-layout.component')).AppLayoutComponent,

    children: [
      { path: '', loadComponent: async () => (await import('./features/home/home.page')).HomePage },
      {
        path: 'wishlists/:id',
        loadComponent: async () =>
          (await import('./features/wishlists/wishlists.page')).WishlistsPage,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
