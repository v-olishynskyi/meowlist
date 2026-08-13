import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/supabase/supabase.service';
import { ModalFlowRuntimeStore } from '../../../core/modal/modal-flow-runtime.store';
import {
  Event,
  EventDraft,
  GiftDraft,
  UserWishlist,
  Wishlist,
} from '../../../core/modal/modal.types';
import { WishlistStatus } from '../../../core/types';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class WishlistApi {
  supabase = inject(SupabaseService).supabase;

  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  getWishlists(ownerId: string) {
    return this.supabase
      .from('wishlists')
      .select('*, event:events(*), gifts(*)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
  }

  async createWishlist(
    ownerId: string,
    status: WishlistStatus,
    slug: string,
  ): Promise<{ data: Wishlist | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabase
      .from('wishlists')
      .insert({
        owner_id: ownerId,
        status,
        slug,
      })
      .select()
      .single();

    return { data, error };
  }

  createEvent(wishlistId: string, eventData: EventDraft) {
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

  removeEvent(eventId: string) {
    return this.supabase.from('events').delete().eq('wishlist_id', eventId);
  }

  updateEvent(wishlistId: string, eventData: Partial<Event>) {
    return this.supabase.from('events').update(eventData).eq('wishlist_id', wishlistId);
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

  deleteGift(giftId: string) {
    return this.supabase.from('gifts').delete().eq('id', giftId);
  }

  updateWishlistStatus(wishlistId: string, status: WishlistStatus) {
    return this.supabase.from('wishlists').update({ status }).eq('id', wishlistId).select();
  }

  getWishlist(wishlistId: string) {
    return this.supabase
      .from('wishlists')
      .select('*, event:events(*), gifts(*)')
      .eq('id', wishlistId)
      .single();
  }

  getWishlistBySlug(slug: string) {
    return this.supabase
      .from('wishlists')
      .select('*, event:events(*), gifts(*)')
      .eq('slug', slug)
      .single();
  }

  removeWishlist(wishlistId: string) {
    return this.supabase.from('wishlists').delete().eq('id', wishlistId);
  }

  uploadGiftImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    return this.supabase.storage
      .from('gifts')
      .upload(`private/${image.name}-${Math.random()}`, formData);
  }

  deleteGiftImage(imagePath: string) {
    return this.supabase.storage.from('gifts').remove([imagePath]);
  }
}
