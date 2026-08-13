import { computed, inject, Injectable, signal } from '@angular/core';
import { ModalFlowRuntimeStore } from '../../../core/modal/modal-flow-runtime.store';
import {
  Event,
  EventDraft,
  GiftDraft,
  ModalFlowKey,
  Wishlist,
} from '../../../core/modal/modal.types';
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

  // TODO: REFACTOR THIS SHIT
  async handleEvent(eventData?: EventDraft | null) {
    if (this.isEditMode()) {
      const wishlistId = this.wishlist()!.id;

      // if eventData is null - do nothing, just return
      // maybe in the future we will implement event deletion, but for now we just ignore it
      if (!eventData) return;

      // if eventData is not null - update or create the event
      // first we need to check if the wishlist already has an event
      // if it does - update it, if not - create a new one
      if (this.event()) {
        const updatedEventData: Partial<Event> = {
          name: eventData.name,
          description: eventData.description || null,
          event_date: eventData.event_date || null,
          location: eventData.location || null,
        };

        const { error } = await this.wishlistApi.updateEvent(wishlistId, updatedEventData);

        if (error) throw error;

        this.modalFlowRuntimeStore.updateSessionState(this.modalFlowKey(), (state) => ({
          ...state,
          event: { ...this.event()!, ...updatedEventData },
        }));
      } else {
        const { data, error } = await this.wishlistApi.createEvent(wishlistId, eventData);

        if (error) throw error;

        this.modalFlowRuntimeStore.updateSessionState(this.modalFlowKey(), (state) => ({
          ...state,
          event: data,
        }));
      }
    } else {
      const shouldCreateEvent = !!eventData;

      const ownerId = this.authStore.profile()!.id;
      let newWishlist: Wishlist | null;

      const slug = this.generateSlug(eventData?.name);

      const { data, error } = await this.wishlistApi.createWishlist(
        ownerId,
        WishlistStatus.DRAFT,
        slug,
      );
      if (error) throw error;

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

    // add gift to the existing wishlist's gifts array
    this.modalFlowRuntimeStore.updateSessionState(this.modalFlowKey(), (state) => ({
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

    this.modalFlowRuntimeStore.updateSessionState(this.modalFlowKey(), (state) => ({
      ...state,
      gifts: state.gifts.filter((gift) => gift.id !== giftId),
    }));
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
    const suffix = Math.random().toString(36).substring(2, 13);

    if (!name) return suffix;

    return `${slugify(name, {
      locale: 'uk',
      lower: true,
      replacement: '_',
    })}_${suffix}`;
  }
}
