import { computed, inject, Injectable, signal } from '@angular/core';
import { ModalFlowRuntimeStore } from '../../../core/modal/modal-flow-runtime.store';
import {
  EventDraft,
  GiftDraft,
  ModalFlowKey,
  UserWishlist,
  Wishlist,
} from '../../../core/modal/modal.types';
import { WishlistApi } from './wishlist.api';
import { AuthStore } from '../../../core/auth/auth.store';
import { GiftReservationStatus, WishlistStatus } from '../../../core/types';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/toast/toast.service';
import slugify from 'slugify';

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
        const slug = eventData?.name
          ? slugify(`${eventData.name} ${Math.random().toString(36).substring(2, 8)}`, {
              locale: 'uk',
              lower: true,
              replacement: '_',
            })
          : Math.random().toString(36).substring(2, 13);

        const { data, error } = await this.wishlistApi.createWishlist(
          ownerId,
          WishlistStatus.DRAFT,
          slug,
        );

        if (error) {
          throw error;
        }

        newWishlist = data;

        this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
          ...state,
          wishlist: newWishlist,
        }));

        this.toastService.showToast({
          message: 'Вішлист успішно створено. Тепер ви можете додати подарунки',
          type: 'success',
        });
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
    const wishlistId = this.session()!.state.wishlist!.id;

    const { data, error } = await this.wishlistApi.createGift(wishlistId, giftData);

    if (error) throw error;

    this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
      ...state,
      gifts: [data, ...state.gifts],
    }));
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

  async deleteGift(giftId: string) {
    const { error } = await this.wishlistApi.deleteGift(giftId);

    if (error) throw error;

    if (this.isEditMode()) {
      this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
        ...state,
        gifts: state.gifts.filter((gift) => gift.id !== giftId),
      }));
    }
  }

  async loadWishlists() {
    await this.authStore.loadProfile();

    const ownerId = this.authStore.profile()!.id;
    if (!ownerId) return;

    const { data, error } = await this.wishlistApi.getWishlists(ownerId);

    if (error) throw error;

    this._wishlistsObject$.next(data);
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
