import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../core/modal/modal-flow-runtime.store';
import { ModalFlowKey } from '../../../../core/modal/modal.types';
import { ModalActionsComponent } from '../../../../core/modal/modal-actions.component';
import { SortMenuComponent } from './components/sort-menu/sort-menu.component';
import { WishlistApi } from '../../data/wishlist.api';
import { ModalStore } from '../../../../core/modal/modal.store';
import { GiftReservationStatus } from '../../../../core/types';
import { ToastService } from '../../../../core/toast/toast.service';
import { WishlistEditorStore } from '../../data/wishlist-editor.store';

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
  protected readonly GiftReservationStatus = GiftReservationStatus;
  SortBy = SortBy;
  router = inject(Router);
  wishlistApi = inject(WishlistApi);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  readonly wishlistEditorStore = inject(WishlistEditorStore);
  modalStore = inject(ModalStore);
  private toastService = inject(ToastService);

  readonly event = this.wishlistEditorStore.event;
  readonly wishlist = this.wishlistEditorStore.wishlist;
  readonly gifts = this.wishlistEditorStore.gifts;
  readonly isEditMode = this.wishlistEditorStore.isEditMode;

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

  async deleteGift(giftId: string) {
    try {
      await this.wishlistApi.deleteGift(giftId);

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

  editEvent() {}

  async publishWishlist() {
    console.log('isEditMode()', this.wishlistEditorStore.isEditMode());
    // try {
    //   this.isPublishing.set(true);
    //   const wishlistId = this.wishlist()?.id;
    //   // await this.wishlistEditorStore.updateWishlistStatus(wishlistId, WishlistStatus.PUBLISHED);
    //   this.router.navigate(['/wishlists']);
    //   this.modalFlowRuntimeStore.clearSession(ModalFlowKey.NEW_WISHLIST);
    //   this.modalStore.closeModal();
    // } catch (error) {
    //   console.error('Error publishing wishlist:', error);
    //   this.toastService.showToast({
    //     message: 'Помилка при публікації вішлисту. Будь ласка, спробуйте ще раз.',
    //     type: 'error',
    //   });
    // } finally {
    //   this.isPublishing.set(false);
    // }
  }
}
