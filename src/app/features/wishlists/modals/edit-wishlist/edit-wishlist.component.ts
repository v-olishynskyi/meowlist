import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../core/modal/modal-flow-runtime.store';
import { ModalFlowKey } from '../../../../core/modal/modal.types';
import { ModalActionsComponent } from '../../../../core/modal/modal-actions.component';
import { SortMenuComponent } from './components/sort-menu/sort-menu.component';
import { WishlistApi } from '../../data/wishlist.api';
import { WishlistStore } from '../../data/wishlist.store';
import { ModalStore } from '../../../../core/modal/modal.store';
import { WishlistStatus } from '../../../../core/types';
import { ToastService } from '../../../../core/toast/toast.service';

export enum SortBy {
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
}
@Component({
  selector: 'app-edit-wishlist',
  templateUrl: './edit-wishlist.component.html',
  imports: [DecimalPipe, DatePipe, ModalActionsComponent, NgTemplateOutlet, SortMenuComponent],
})
export class EditWishlistModal {
  SortBy = SortBy;
  router = inject(Router);
  wishlistApi = inject(WishlistApi);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  wishlistStore = inject(WishlistStore);
  modalStore = inject(ModalStore);
  private toastService = inject(ToastService);

  session = computed(() => this.modalFlowRuntimeStore.getSession(ModalFlowKey.NEW_WISHLIST));
  event = computed(() => (this.session()?.state.event.name ? this.session()?.state.event : null));
  gifts = computed(
    () =>
      this.session()?.state.gifts.sort((a, b) => {
        if (this.sortsBy() === SortBy.PRICE_ASC) {
          return (a.price ?? 0) - (b.price ?? 0);
        } else {
          return (b.price ?? 0) - (a.price ?? 0);
        }
      }) || [],
  );

  isPublishing = signal(false);
  canPublish = computed(() => this.gifts().length > 0);

  sortsBy = signal<SortBy>(SortBy.PRICE_DESC);

  setSortsBy(sort: SortBy) {
    this.sortsBy.set(sort);
  }

  addGift() {
    this.router.navigate([], {
      queryParams: {
        flow: 'new-wishlist',
        step: 'add-gift',
      },
    });
  }

  deleteGift(giftId: string) {
    try {
      this.wishlistStore.deleteGift(giftId);

      this.toastService.showToast({
        message: 'Подарунок успішно видалено',
        type: 'success',
      });
    } catch (error) {
      console.error('Error removing gift:', error);
      this.toastService.showToast({
        message: 'Помилка при видаленні подарунка. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
    }
  }

  async publishWishlist() {
    try {
      this.isPublishing.set(true);
      const wishlistId = this.session()!.state!.wishlist!.id;
      await this.wishlistStore.updateWishlistStatus(wishlistId, WishlistStatus.PUBLISHED);
      this.router.navigate(['/wishlists']);
      this.modalFlowRuntimeStore.clearSession(ModalFlowKey.NEW_WISHLIST);
      this.modalStore.closeModal();
    } catch (error) {
      console.error('Error publishing wishlist:', error);
      this.toastService.showToast({
        message: 'Помилка при публікації вішлисту. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
    } finally {
      this.isPublishing.set(false);
    }
  }
}
