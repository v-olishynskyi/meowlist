import { computed, inject, Injectable } from '@angular/core';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';
import {
  EventDraft,
  GiftDraft,
  ModalFlowKey,
  Wishlist,
} from '../../../../components/modal/data/modal.types';
import { WishlistApi } from '../../../../core/wishlist.api';
import { AuthStore } from '../../../../core/auth.store';
import { WishlistStatus } from '../../../../core/types';

@Injectable({
  providedIn: 'root',
})
export class WishlistStore {
  wishlistApi = inject(WishlistApi);
  authStore = inject(AuthStore);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  session = computed(() => this.modalFlowRuntimeStore.getSession(ModalFlowKey.NEW_WISHLIST));
  event = computed(() => this.session()?.state.event);

  isEditMode = computed(() => false);

  async handleEvent(eventData?: EventDraft) {
    try {
      const shouldCreateEvent = !!eventData?.name;
      console.log('🚀 - WishlistStore - handleEvent - shouldCreateEvent:', shouldCreateEvent);

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
}
