import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WishlistApi } from '../../core/wishlist.api';
import { Gift, ModalFlowKey, UserWishlist } from '../../components/modal/data/modal.types';
import { AuthStore } from '../../core/auth.store';
import { ConfirmationModalStore } from '../../components/confirmation-modal/confirmation-modal.store';
import { WishlistStore } from '../modals/feature-modals/data/wishlist.store';
import { UtilsService } from '../../shared/utils/utils.service';
import { GiftReservationStatus } from '../../core/types';

@Component({
  selector: 'app-wishlist-details-page',
  templateUrl: './wishlist-details.page.html',
  imports: [NgTemplateOutlet, DatePipe, DecimalPipe, RouterLink],
})
export class WishlistDetailsPage implements OnInit {
  log = console.log;
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  utilsService = inject(UtilsService);
  wishlistApi = inject(WishlistApi);
  authStore = inject(AuthStore);
  confirmationModalStore = inject(ConfirmationModalStore);
  wishlistStore = inject(WishlistStore);

  protected readonly GiftReservationStatus = GiftReservationStatus;

  readonly isLoading = signal<boolean>(false);
  readonly wishlistData = signal<UserWishlist | null>(null);

  readonly isCopyingLink = signal<boolean>(false);
  readonly isLinkCopied = signal<boolean>(false);

  readonly giftHandleReservationId = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.isLinkCopied()) {
        setTimeout(() => {
          this.isLinkCopied.set(false);
        }, 1500);
      }
    });
  }

  readonly skeletonGiftItems = [1, 2, 3, 4, 5];
  readonly showAllGifts = signal(false);

  readonly canEditWishlist = computed(
    () => this.authStore.profile()?.id === this.wishlistData()?.owner_id,
  );

  wishlistIllustrationUrl = '';

  async ngOnInit() {
    const wishlistSlug = this.activatedRoute.snapshot.paramMap.get('id');

    try {
      this.isLoading.set(true);

      const { data, error } = await this.wishlistApi.getWishlist(wishlistSlug!);
      if (error) throw error;

      this.wishlistData.set(data);
    } catch (error) {
      console.error('Error loading wishlist details:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    // TODO
    this.router.navigate(['/wishlists']);
  }

  async shareWishlist() {
    await navigator.share({
      title: this.wishlistData()?.event?.name || 'Список бажань',
      text: 'Перегляньте мій список бажань!',
      url: this.getShareUrl(this.wishlistData()?.id || ''),
    });
  }

  editWishlist() {}

  getShareUrl(id: string) {
    return `${window.location.origin}/wishlists/${id}`;
  }

  showConfirmModal() {
    this.confirmationModalStore.open({
      title: 'Підтвердження видалення',
      message: 'Ви впевнені, що хочете видалити цей список бажань?',
      cancelButtonText: 'Скасувати',
      confirmButtonText: 'Видалити',
      onConfirm: () => this.deleteWishlist(),
    });
  }

  async deleteWishlist() {
    await this.wishlistStore.deleteWishlist(this.wishlistData()?.id || '');
    this.router.navigate(['/wishlists']);
  }

  async copyWishlistLink(id: string) {
    this.isCopyingLink.set(true);
    try {
      const shareUrl = this.getShareUrl(id);
      await this.copyToClipboard(shareUrl);
      this.isLinkCopied.set(true);
    } catch (error) {
      console.error(error);
    } finally {
      this.isCopyingLink.set(false);
    }
  }

  async cancelGiftReservation(giftId: string) {
    this.giftHandleReservationId.set(giftId);
    // TODO: add guard to prevent reserving already reserved gifts
    await this.wishlistStore.cancelGiftReservation(giftId);
    this.giftHandleReservationId.set(null);
  }

  async reserveGift(giftId: string) {
    // check if the user is authenticated
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate([this.router.url], {
        queryParams: {
          ...this.utilsService.buildFlowQueryParams(ModalFlowKey.AUTH_OTP),
        },
      });
      return;
    }
    this.giftHandleReservationId.set(giftId);
    // TODO: add guard to prevent reserving already reserved gifts
    await this.wishlistStore.reserveGift(giftId);
    this.giftHandleReservationId.set(null);
  }

  async copyToClipboard(textToCopy: string) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      // Use the 'out of viewport hidden text area' trick
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;

      // Move textarea out of the viewport so it's not visible
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';

      document.body.prepend(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
  }

  isGiftReservedByMe(giftId: string): boolean {
    // TODO
    const profile = this.authStore.profile();
    if (!profile) return false;

    console.log('IS GIFT RESERVED BY ME:', giftId, profile.reservations);

    return profile.reservations.some((reservation) => reservation.gift_id === giftId);
  }
}
