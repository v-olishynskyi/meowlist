import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ReservationWithGift } from '../../core/types';
import { WishlistApi } from '../wishlists/data/wishlist.api';
import { AuthStore } from '../../core/auth/auth.store';
import { ToastService } from '../../core/toast/toast.service';
import { GiftCardComponent } from '../../shared/ui/gift-card/gift-card.component';
import { WishlistStore } from '../wishlists/data/wishlist.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reserved-gifts',
  templateUrl: './reserved-gifts.page.html',
  imports: [GiftCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservedGiftsPage implements OnInit {
  readonly router = inject(Router);
  wishlistApi = inject(WishlistApi);
  authStore = inject(AuthStore);
  toastService = inject(ToastService);
  wishlistStore = inject(WishlistStore);

  isLoading = signal(false);
  reservations = signal<Array<ReservationWithGift>>([]);
  handlingReservationId = signal<string | null>(null);

  readonly gifts = computed(() => this.reservations().map((reservation) => reservation.gift));
  readonly skeletonItems = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.fetchReservedGifts();
  }

  openWishlistDetails(slug: string) {
    this.router.navigate(['/wishlists', slug]);
  }

  async cancelGiftReservation(giftId: string) {
    this.handlingReservationId.set(giftId);
    // TODO: add guard to prevent reserving already reserved gifts
    await this.wishlistStore.cancelGiftReservation(giftId);
    this.reservations.set(
      this.reservations().filter((reservation) => reservation.gift.id !== giftId),
    );
    this.handlingReservationId.set(null);
  }

  async fetchReservedGifts(): Promise<void> {
    try {
      this.isLoading.set(true);
      const userId = this.authStore.profile()!.id;

      const { data, error } = await this.wishlistApi.getUserReservations(userId);

      if (error) throw error;

      this.reservations.set(data);
    } catch (error) {
      console.error('Error fetching reserved gifts:', error);
      this.toastService.showToast({
        message: 'Помилка при отриманні зарезервованих подарунків',
        type: 'error',
      });
    } finally {
      this.isLoading.set(false);
    }
  }
}
