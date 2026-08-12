import { computed, inject, Injectable, signal } from '@angular/core';
import { ModalFlowRuntimeStore } from '../../../core/modal/modal-flow-runtime.store';
import { EventDraft, GiftDraft, ModalFlowKey, Wishlist } from '../../../core/modal/modal.types';
import { AuthStore } from '../../../core/auth/auth.store';
import slugify from 'slugify';
import { WishlistApi } from './wishlist.api';
import { WishlistStatus } from '../../../core/types';

@Injectable({
  providedIn: 'root',
})
export class WishlistEditorStore {
  private readonly wishlistApi = inject(WishlistApi);
  private readonly modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  private readonly authStore = inject(AuthStore);

  isEditMode = signal<boolean>(false);

  readonly modalFlowKey = computed(() =>
    this.isEditMode() ? ModalFlowKey.EDIT_WISHLIST : ModalFlowKey.NEW_WISHLIST,
  );

  readonly session = computed(() => this.modalFlowRuntimeStore.getSession(this.modalFlowKey()));

  readonly wishlist = computed(() => this.session()?.state.wishlist);
  readonly event = computed(() => this.session()?.state.event);
  readonly gifts = computed(() => this.session()?.state.gifts || []);

  setEditMode(isEditMode: boolean) {
    this.isEditMode.set(isEditMode);
  }

  async handleEvent(eventData?: EventDraft) {
    if (this.isEditMode()) {
    } else {
      const shouldCreateEvent = !!eventData?.name;

      const ownerId = this.authStore.profile()!.id;
      let newWishlist: Wishlist | null;

      const slug = this.generateSlug(eventData?.name);

      const { data, error } = await this.wishlistApi.createWishlist(
        ownerId,
        WishlistStatus.DRAFT,
        slug,
      );

      if (error) {
        throw error;
      }

      newWishlist = data;

      this.modalFlowRuntimeStore.updateSessionState(this.modalFlowKey(), (state) => ({
        ...state,
        wishlist: newWishlist!,
      }));

      if (!shouldCreateEvent) return;

      const { data: newEvent, error: eventError } = await this.wishlistApi.createEvent(
        newWishlist!.id,
        eventData!,
      );
      if (eventError) throw eventError;

      this.modalFlowRuntimeStore.updateSessionState(this.modalFlowKey(), (state) => ({
        ...state,
        event: newEvent,
      }));
    }
  }

  async addNewGift(giftData: GiftDraft) {
    const wishlistId = this.wishlist()!.id;

    const { data, error } = await this.wishlistApi.createGift(wishlistId, giftData);

    if (error) throw error;

    if (this.isEditMode()) {
      // add gift to the existing wishlist's gifts array
      this.modalFlowRuntimeStore.updateSessionState(this.modalFlowKey(), (state) => ({
        ...state,
        gifts: [data, ...state.gifts],
      }));
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
    const { error } = await this.wishlistApi.deleteGift(giftId);

    if (error) throw error;

    if (this.isEditMode()) {
      this.modalFlowRuntimeStore.updateSessionState(this.modalFlowKey(), (state) => ({
        ...state,
        gifts: state.gifts.filter((gift) => gift.id !== giftId),
      }));
    }
  }

  async publishWishlist(wishlistId: string) {
    if (this.gifts().length === 0) {
      throw new Error('Ви не можете опублікувати список бажань без подарунків.');
    }

    const { error } = await this.wishlistApi.updateWishlistStatus(
      wishlistId,
      WishlistStatus.PUBLISHED,
    );

    if (error) throw error;
  }

  private generateSlug(name?: string | null): string {
    return name
      ? slugify(`${name} ${Math.random().toString(36).substring(2, 8)}`, {
          locale: 'uk',
          lower: true,
          replacement: '_',
        })
      : Math.random().toString(36).substring(2, 13);
  }
}
