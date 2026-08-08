import { computed, inject, Injectable, signal } from '@angular/core';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';
import {
  EventDraft,
  GiftDraft,
  ModalFlowKey,
  UserWishlist,
  Wishlist,
} from '../../../../components/modal/data/modal.types';
import { WishlistApi } from '../../../../core/wishlist.api';
import { AuthStore } from '../../../../core/auth.store';
import { WishlistStatus } from '../../../../core/types';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../../core/toast.service';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class WishlistStore {
  wishlistApi = inject(WishlistApi);
  authStore = inject(AuthStore);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  toastService = inject(ToastService);

  session = computed(() => this.modalFlowRuntimeStore.getSession(ModalFlowKey.NEW_WISHLIST));
  event = computed(() => this.session()?.state.event);

  private readonly _wishlistsObject$ = new BehaviorSubject<UserWishlist[]>([]);
  readonly wishlists$ = this._wishlistsObject$.asObservable();
  readonly wishlists = toSignal(this.wishlists$);

  isEditMode = computed(() => false);

  async handleEvent(eventData?: EventDraft) {
    try {
      const shouldCreateEvent = !!eventData?.name;

      const ownerId = this.authStore.profile()!.id;
      let newWishlist: Wishlist | null;

      if (!this.isEditMode()) {
        const { data, error } = await this.wishlistApi.createWishlist(
          ownerId,
          WishlistStatus.DRAFT,
        );

        if (error) {
          throw error;
        }

        newWishlist = data;

        this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
          ...state,
          wishlist: newWishlist,
        }));
      }

      if (!shouldCreateEvent) return;

      const { data: newEvent, error: eventError } = await this.wishlistApi.createEvent(
        newWishlist!.id,
        eventData!,
      );
      if (eventError) throw eventError;

      this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
        ...state,
        event: newEvent,
      }));
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  async addNewGift(giftData: GiftDraft) {
    try {
      const wishlistId = this.session()!.state.wishlist!.id;

      const { data, error } = await this.wishlistApi.createGift(wishlistId, giftData);

      if (error) throw error;

      this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
        ...state,
        gifts: [data, ...state.gifts],
      }));
    } catch (error) {
      console.error('Error adding new gift:', error);
    }
  }

  async uploadGiftImage(image: File) {
    try {
      const { data, error } = await this.wishlistApi.uploadGiftImage(image);
      if (error) throw error;

      const publicUrl = this.wishlistApi.supabase.storage.from('gifts').getPublicUrl(data.path)
        .data.publicUrl;

      return publicUrl;
    } catch (error) {
      console.error('Error uploading gift image:', error);
      throw error;
    }
  }

  async removeGift(giftId: string) {
    try {
      const { error } = await this.wishlistApi.removeGift(giftId);
      if (error) throw error;

      this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
        ...state,
        gifts: state.gifts.filter((gift) => gift.id !== giftId),
      }));
    } catch (error) {
      console.error('Error removing gift:', error);
    } finally {
    }
  }

  async loadWishlists() {
    try {
      const ownerId = this.authStore.profile()!.id;
      const { data, error } = await this.wishlistApi.getWishlists(ownerId);

      if (error) throw error;

      this._wishlistsObject$.next(data);
    } catch (error) {
      console.error('Error loading wishlists:', error);
    }
  }

  async updateWishlistStatus(wishlistId: string, status: WishlistStatus) {
    try {
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
    } catch (error: any) {
      this.toastService.showToast({
        message: error?.message || 'Помилка при зміні статусу. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
      console.error('Error publishing wishlist:', error);
    }
  }

  async deleteWishlist(wishlistId: string) {
    try {
      const { error } = await this.wishlistApi.removeWishlist(wishlistId);
      if (error) throw error;

      const updatedWishlists = this.wishlists()!.filter((wishlist) => wishlist.id !== wishlistId);
      this._wishlistsObject$.next(updatedWishlists);
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
  }
}
