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
import { WishlistStore } from '../../data/wishlist.store';

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
  console = console;
  protected readonly GiftReservationStatus = GiftReservationStatus;
  SortBy = SortBy;
  router = inject(Router);
  wishlistApi = inject(WishlistApi);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  readonly wishlistEditorStore = inject(WishlistEditorStore);
  private modalStore = inject(ModalStore);
  private wishlistsStore = inject(WishlistStore);
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
      await this.wishlistEditorStore.deleteGift(giftId);

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

  editEvent() {
    const baseUrl = this.router.url.split('?')[0];
    const flow = this.wishlistEditorStore.isEditMode()
      ? ModalFlowKey.EDIT_WISHLIST
      : ModalFlowKey.NEW_WISHLIST;

    this.router.navigate([baseUrl], {
      queryParams: {
        flow,
        step: 'edit-event',
      },
    });
  }

  async updateWishlist() {
    try {
      this.isPublishing.set(true);
      const wishlistId = this.wishlist()!.id;

      // TODO
      await this.wishlistEditorStore.publishWishlist(wishlistId);
      this.modalFlowRuntimeStore.clearSession(ModalFlowKey.EDIT_WISHLIST);
      this.modalStore.closeModal();

      this.toastService.showToast({
        message: 'Вішлист успішно оновлено',
        type: 'success',
      });

      await this.wishlistsStore.reloadWishlist(wishlistId);
      await this.wishlistsStore.loadWishlists();
    } catch (error) {
      this.toastService.showToast({
        message: 'Помилка при оновленні вішлисту. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
    } finally {
      this.isPublishing.set(false);
    }
  }

  async publishWishlist() {
    try {
      this.isPublishing.set(true);

      const wishlistId = this.wishlist()!.id;
      await this.wishlistEditorStore.publishWishlist(wishlistId);

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
