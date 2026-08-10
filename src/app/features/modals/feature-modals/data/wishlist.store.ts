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
import { GiftReservationStatus, WishlistStatus } from '../../../../core/types';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../../core/toast.service';
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

  async deleteGift(giftId: string) {
    try {
      const { error } = await this.wishlistApi.deleteGift(giftId);
      if (error) throw error;

      if (this.isEditMode()) {
        this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
          ...state,
          gifts: state.gifts.filter((gift) => gift.id !== giftId),
        }));
      }
    } catch (error) {
      console.error('Error removing gift:', error);
      this.toastService.showToast({
        message: 'Помилка при видаленні подарунка. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
    }
  }

  async loadWishlists() {
    try {
      await this.authStore.loadProfile();

      const ownerId = this.authStore.profile()!.id;
      if (!ownerId) return;

      const { data, error } = await this.wishlistApi.getWishlists(ownerId);

      if (error) throw error;

      this._wishlistsObject$.next(data);
    } catch (error) {
      console.error('Error loading wishlists:', error);
      this.toastService.showToast({
        message: 'Помилка при завантаженні списків бажань. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
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

      this.toastService.showToast({
        message:
          status === WishlistStatus.PUBLISHED
            ? 'Вішліст успішно опубліковано'
            : 'Статус списку бажань змінено',
        type: 'success',
      });
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
      this.toastService.showToast({
        message: 'Вішлист успішно видалено',
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      this.toastService.showToast({
        message: 'Помилка при видаленні вішлисту',
        type: 'error',
      });
    }
  }

  async reserveGift(giftId: string) {
    try {
      const ownerId = this.authStore.profile()?.id;

      const { data: reservationData, error } = await this.wishlistApi.reserveGift(giftId, ownerId!);

      if (error) throw error;

      this.authStore.addReservation(reservationData!);

      const updatedWishlists = this.wishlists()!.map((wishlist) => {
        const updatedGifts = wishlist.gifts.map((gift) =>
          gift.id === giftId
            ? { ...gift, reservation_status: GiftReservationStatus.RESERVED }
            : gift,
        );
        return { ...wishlist, gifts: updatedGifts };
      });

      this._wishlistsObject$.next(updatedWishlists);

      this.toastService.showToast({
        message: 'Подарунок успішно зарезервовано Вами',
        type: 'success',
      });
    } catch (error) {
      console.error('Error reserving gift:', error);
      this.toastService.showToast({
        message: 'Помилка при резервуванні подарунка',
        type: 'error',
      });
    }
  }

  async cancelGiftReservation(giftId: string) {
    try {
      const ownerId = this.authStore.profile()?.id;

      const { error } = await this.wishlistApi.cancelGiftReservation(giftId, ownerId!);

      if (error) throw error;

      this.authStore.removeReservation(giftId);

      const updatedWishlists = this.wishlists()!.map((wishlist) => {
        const updatedGifts = wishlist.gifts.map((gift) =>
          gift.id === giftId
            ? { ...gift, reservation_status: GiftReservationStatus.AVAILABLE }
            : gift,
        );
        return { ...wishlist, gifts: updatedGifts };
      });

      this._wishlistsObject$.next(updatedWishlists);

      this.toastService.showToast({
        message: 'Резервування подарунка скасовано',
        type: 'success',
      });
    } catch (error) {
      console.error('Error canceling gift reservation:', error);
      this.toastService.showToast({
        message: 'Помилка при скасуванні резервування подарунка',
        type: 'error',
      });
    }
  }
}
