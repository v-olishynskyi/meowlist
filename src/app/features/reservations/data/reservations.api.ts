import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationsApi {
  supabase = inject(SupabaseService).supabase;

  reserveGift(giftId: string, ownerId: string) {
    return this.supabase
      .from('gifts_reservation')
      .insert({ gift_id: giftId, owner_id: ownerId })
      .select()
      .single();
  }

  cancelGiftReservation(giftId: string) {
    return this.supabase.from('gifts_reservation').delete().eq('gift_id', giftId);
  }

  getUserReservations(ownerId: string) {
    return this.supabase
      .from('gifts_reservation')
      .select('*, gift:gifts(*, wishlist:wishlists(id, slug))')
      .eq('owner_id', ownerId);
  }
}
