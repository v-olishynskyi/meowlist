import type { ResolveFn } from '@angular/router';
import type { ActivatedRouteSnapshot } from '@angular/router';
import { UserWishlist } from '../../../components/modal/data/modal.types';
import { inject } from '@angular/core';
import { WishlistApi } from '../../../core/wishlist.api';

export const wishlistResolver: ResolveFn<UserWishlist | null> = async (
  route: ActivatedRouteSnapshot,
) => {
  // Implement your resolver logic here
  const wishlistApi = inject(WishlistApi);

  const wishlistSlug = route.paramMap.get('id');
  if (!wishlistSlug) {
    return null;
  }

  const { data } = await wishlistApi.getWishlistBySlug(wishlistSlug);

  return data || null;
};
