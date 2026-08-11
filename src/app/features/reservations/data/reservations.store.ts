import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../../../core/auth/auth.store';
import { GiftReservation, Profile } from '../../../core/types';
import { ReservationsApi } from './reservations.api';

@Injectable({
  providedIn: 'root',
})
export class ReservationsStore {
  private authStore = inject(AuthStore);
  private reservationsApi = inject(ReservationsApi);

  async reserveGift(giftId: string) {
    const ownerId = this.authStore.profile()?.id;

    const { data: reservationData, error } = await this.reservationsApi.reserveGift(
      giftId,
      ownerId!,
    );

    if (error) throw error;

    this.addReservationToProfile(reservationData!);
  }

  async cancelGiftReservation(giftId: string) {
    const { error } = await this.reservationsApi.cancelGiftReservation(giftId);

    if (error) throw error;

    this.removeReservationFromProfile(giftId);
  }

  addReservationToProfile(reservation: GiftReservation) {
    // TODO
    const updatedProfile: Profile = {
      ...this.authStore.profile()!,
      reservations: [...(this.authStore.profile()?.reservations || []), reservation],
    };
    this.authStore.profile.set(updatedProfile);
  }

  removeReservationFromProfile(giftId: string) {
    // TODO
    const updatedProfile: Profile = {
      ...this.authStore.profile()!,
      reservations: (this.authStore.profile()?.reservations || []).filter(
        (reservation) => reservation.gift_id !== giftId,
      ),
    };
    this.authStore.profile.set(updatedProfile);
  }
}
