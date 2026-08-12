import { computed, inject, Injectable } from '@angular/core';
import { ModalFlowRuntimeStore } from '../../../core/modal/modal-flow-runtime.store';
import { ModalFlowKey, UserWishlist } from '../../../core/modal/modal.types';
import { WishlistApi } from './wishlist.api';
import { AuthStore } from '../../../core/auth/auth.store';
import { WishlistStatus } from '../../../core/types';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class WishlistStore {
  wishlistApi = inject(WishlistApi);
  authStore = inject(AuthStore);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  session = computed(() => this.modalFlowRuntimeStore.getSession(ModalFlowKey.NEW_WISHLIST));

  private readonly _wishlistsObject$ = new BehaviorSubject<UserWishlist[]>([]);
  readonly wishlists$ = this._wishlistsObject$.asObservable();
  readonly wishlists = toSignal(this.wishlists$);

  async loadWishlists() {
    const ownerId = this.authStore.profile()!.id;
    if (!ownerId) return;

    const { data, error } = await this.wishlistApi.getWishlists(ownerId);

    if (error) throw error;

    this._wishlistsObject$.next(data);
  }

  async deleteGift(giftId: string) {
    const { error } = await this.wishlistApi.deleteGift(giftId);

    if (error) throw error;

    const updatedWishlists = this.wishlists()!.map((wishlist) => ({
      ...wishlist,
      gifts: wishlist.gifts.filter((gift) => gift.id !== giftId),
    }));
    this._wishlistsObject$.next(updatedWishlists);
  }

  async updateWishlistStatus(wishlistId: string, status: WishlistStatus) {
    const wishlist = this.wishlists()!.find((w) => w.id === wishlistId);
    if (wishlist && wishlist.gifts.length === 0) {
      throw new Error('Ви не можете опублікувати список бажань без подарунків.');
    }

    const { error } = await this.wishlistApi.updateWishlistStatus(wishlistId, status);

    if (error) throw error;

    const updatedWishlists = this.wishlists()!.map((wishlist) =>
      wishlist.id === wishlistId ? { ...wishlist, status } : wishlist,
    );
    this._wishlistsObject$.next(updatedWishlists);
  }

  async deleteWishlist(wishlistId: string) {
    const { error } = await this.wishlistApi.removeWishlist(wishlistId);

    if (error) throw error;

    const updatedWishlists = this.wishlists()!.filter((wishlist) => wishlist.id !== wishlistId);
    this._wishlistsObject$.next(updatedWishlists);
  }
}
