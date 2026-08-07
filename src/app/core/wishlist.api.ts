import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { ModalFlowRuntimeStore } from '../components/modal/data/modal-flow-runtime.store';
import {
  EventDraft,
  GiftDraft,
  UserWishlist,
  Wishlist,
} from '../components/modal/data/modal.types';
import { WishlistStatus } from './types';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class WishlistApi {
  supabase = inject(SupabaseService).supabase;

  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  async getWishlists(ownerId: string) {
    const response = await this.supabase
      .from('wishlists')
      .select('*, event:events(*), gifts(*)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    return response;
  }

  async createWishlist(
    ownerId: string,
    status: WishlistStatus,
  ): Promise<{ data: Wishlist | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabase
      .from('wishlists')
      .insert({
        owner_id: ownerId,
        status,
      })
      .select()
      .single();

    return { data, error };
  }

  async createEvent(wishlistId: string, eventData: EventDraft) {
    return this.supabase
      .from('events')
      .insert({
        wishlist_id: wishlistId,
        name: eventData.name,
        description: eventData.description || null,
        event_date: eventData.event_date || null,
        location: eventData.location || null,
      })
      .select()
      .single();
  }

  createGift(wishlistId: string, giftData: GiftDraft) {
    const { description, imageUrl, link, name, price } = giftData;

    return this.supabase
      .from('gifts')
      .insert({
        wishlist_id: wishlistId,
        name,
        description: description || null,
        link: link || null,
        price: price || null,
        image_url: imageUrl,
      })
      .select()
      .single();
  }

  removeGift(giftId: string) {
    return this.supabase.from('gifts').delete().eq('id', giftId);
  }

  publishWishlist(wishlistId: string) {
    return this.supabase
      .from('wishlists')
      .update({ status: WishlistStatus.PUBLISHED })
      .eq('id', wishlistId);
  }
}
