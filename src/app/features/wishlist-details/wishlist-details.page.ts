import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WishlistApi } from '../../core/wishlist.api';
import { UserWishlist } from '../../components/modal/data/modal.types';
import { AuthStore } from '../../core/auth.store';

@Component({
  selector: 'app-wishlist-details-page',
  templateUrl: './wishlist-details.page.html',
  imports: [NgTemplateOutlet, DatePipe, DecimalPipe, RouterLink],
})
export class WishlistDetailsPage implements OnInit {
  log = console.log;
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  wishlistApi = inject(WishlistApi);
  authStore = inject(AuthStore);

  readonly isLoading = signal<boolean>(false);
  readonly wishlistData = signal<UserWishlist | null>(null);

  readonly isCopyingLink = signal<boolean>(false);
  readonly isLinkCopied = signal<boolean>(false);

  constructor() {
    effect(() => {
      console.log('is copying link:', this.isCopyingLink());

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
    return `${window.location.origin}/wishlist/${id}`;
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

  toggleFavorite(gift: any) {}

  cancelGiftReservation(giftId: any) {}

  reserveGift(giftId: any) {}

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
}
