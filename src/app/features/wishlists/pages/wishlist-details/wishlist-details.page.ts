import { DatePipe, DecimalPipe, NgTemplateOutlet, ViewportScroller } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WishlistApi } from '../../data/wishlist.api';
import { ModalFlowKey, UserWishlist } from '../../../../core/modal/modal.types';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ConfirmationModalStore } from '../../../../shared/ui/confirmation-modal/confirmation-modal.store';
import { WishlistStore } from '../../data/wishlist.store';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { GiftReservationStatus } from '../../../../core/types';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { GiftCardComponent } from '../../../../shared/ui/gift-card/gift-card.component';
import { ToastService } from '../../../../core/toast/toast.service';
import { ReservationsStore } from '../../../reservations/data/reservations.store';

@Component({
  selector: 'app-wishlist-details-page',
  templateUrl: './wishlist-details.page.html',
  imports: [NgTemplateOutlet, DatePipe, GiftCardComponent, RouterLink],
})
export class WishlistDetailsPage implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private scroller = inject(ViewportScroller);

  log = console.log;
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  utilsService = inject(UtilsService);
  wishlistApi = inject(WishlistApi);
  authStore = inject(AuthStore);
  confirmationModalStore = inject(ConfirmationModalStore);
  wishlistStore = inject(WishlistStore);
  private toastService = inject(ToastService);
  private reservationsStore = inject(ReservationsStore);

  protected readonly GiftReservationStatus = GiftReservationStatus;

  readonly isLoading = signal<boolean>(false);

  private readonly routeData = this.activatedRoute.data;
  readonly wishlistData = toSignal(this.routeData);
  wishlist = signal<UserWishlist | null>(null);

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

    const data = this.wishlistData()?.['wishlist'] as UserWishlist;

    if (data) {
      this.wishlist.set(data);
      this.setMeta(data);
    }
  }

  readonly skeletonGiftItems = [1, 2, 3, 4, 5];
  readonly showAllGifts = signal(false);

  readonly canEditWishlist = computed(
    () => this.authStore.profile()?.id === this.wishlist()?.owner_id,
  );

  wishlistIllustrationUrl = '';

  async ngOnInit() {
    this.scroller.scrollToPosition([0, 0]);
    // const wishlistSlug = this.activatedRoute.snapshot.paramMap.get('id');
    // try {
    //   this.isLoading.set(true);
    //   const { data, error } = await this.wishlistApi.getWishlist(wishlistSlug!);
    //   if (error) throw error;
    //   this.wishlistData.set(data);
    // } catch (error) {
    //   console.error('Error loading wishlist details:', error);
    // } finally {
    //   this.isLoading.set(false);
    // }
  }

  goBack() {
    // TODO
    this.router.navigate(['/wishlists']);
  }

  async shareWishlist() {
    await navigator.share({
      title: this.wishlist()?.event?.name || 'Список бажань',
      text: 'Перегляньте мій список бажань!',
      url: this.getShareUrl(this.wishlist()?.slug || ''),
    });
  }

  editWishlist() {}

  getShareUrl(slug: string) {
    return `${environment.siteUrl}/wishlists/${slug}`;
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
    await this.wishlistStore.deleteWishlist(this.wishlist()?.id || '');
    this.router.navigate(['/wishlists']);
  }

  async deleteGift(giftId: string) {
    this.confirmationModalStore.open({
      title: 'Підтвердження видалення',
      message: 'Ви впевнені, що хочете видалити цей подарунок?',
      cancelButtonText: 'Скасувати',
      confirmButtonText: 'Видалити',
      onConfirm: async () => {
        await this.wishlistStore.deleteGift(giftId);
        this.wishlist.update((wishlist) => ({
          ...wishlist!,
          gifts: wishlist!.gifts.filter((gift) => gift.id !== giftId),
        }));
      },
    });
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
    try {
      this.giftHandleReservationId.set(giftId);
      // TODO: add guard to prevent reserving already reserved gifts
      await this.reservationsStore.cancelGiftReservation(giftId);

      this.wishlist.update((wishlist) => ({
        ...wishlist!,
        gifts: wishlist!.gifts.map((gift) =>
          gift.id === giftId
            ? { ...gift, reservation_status: GiftReservationStatus.AVAILABLE }
            : gift,
        ),
      }));

      this.giftHandleReservationId.set(null);

      this.toastService.showToast({
        message: 'Резервування подарунка скасовано',
        type: 'success',
      });
    } catch (error) {
      this.toastService.showToast({
        message: 'Помилка при скасуванні резервування подарунка',
        type: 'error',
      });
    }
  }

  async reserveGift(giftId: string) {
    try {
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
      await this.reservationsStore.reserveGift(giftId);
      this.giftHandleReservationId.set(null);

      this.toastService.showToast({
        message: 'Подарунок успішно зарезервовано Вами',
        type: 'success',
      });
    } catch (error) {
      console.error('Error reserving gift:', error);
      this.toastService.showToast({
        message: 'Помилка при резервуванні подарунка',
        type: 'error',
      });
    }
  }

  async copyToClipboard(textToCopy: string) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator?.clipboard && window?.isSecureContext) {
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

    return profile.reservations.some((reservation) => reservation.gift_id === giftId);
  }

  private setMeta(wishlist: UserWishlist): void {
    const event = wishlist.event;

    const title = event?.name ?? 'Мій вішліст 🎁';

    const description =
      event?.description ?? `У цьому вішлісті ${wishlist.gifts.length} подарунків 🎁`;

    const url = `${environment.siteUrl}` + `/wishlists/${wishlist.id}`;

    const image = `${environment.siteUrl}` + `/assets/social/gift-create.png`;

    this.title.setTitle(`${title} — MeowList`);

    this.meta.updateTag({
      name: 'description',
      content: description,
    });

    this.meta.updateTag({
      property: 'og:type',
      content: 'website',
    });

    this.meta.updateTag({
      property: 'og:site_name',
      content: 'MeowList',
    });

    this.meta.updateTag({
      property: 'og:title',
      content: title,
    });

    this.meta.updateTag({
      property: 'og:description',
      content: description,
    });

    this.meta.updateTag({
      property: 'og:url',
      content: url,
    });

    this.meta.updateTag({
      property: 'og:image',
      content: image,
    });

    this.meta.updateTag({
      property: 'og:image:alt',
      content: title,
    });
  }
}
