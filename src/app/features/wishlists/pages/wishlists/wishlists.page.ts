import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { WishlistStore } from '../../data/wishlist.store';
import { UtilsService } from '../../../../shared/utils/utils.service';
import {
  EditWishlistFlowState,
  EditWishListStepKey,
  ModalFlowKey,
  StepOf,
  UserWishlist,
} from '../../../../core/modal/modal.types';
import { RouterLink } from '@angular/router';
import { WishlistStatus } from '../../../../core/types';
import { WishlistCardComponent } from '../../components/wishlist-card/wishlist-card.component';
import { ToastService } from '../../../../core/toast/toast.service';
import { WishlistFilter, WishlistFilters } from '../../data/types';
import { WishlistEditorStore } from '../../data/wishlist-editor.store';
import { ModalFlowLauncher } from '../../../../core/modal/modal-flow-launcher';

@Component({
  selector: 'app-wishlists-page',
  templateUrl: './wishlists.page.html',
  imports: [RouterLink, WishlistCardComponent],
})
export class WishlistsPage implements OnInit {
  WishlistStatus = WishlistStatus;
  wishlistFilters = WishlistFilters;
  ModalFlowKey = ModalFlowKey;
  utilsService = inject(UtilsService);
  wishlistsStore = inject(WishlistStore);
  wishlistEditorStore = inject(WishlistEditorStore);
  modalFlowLauncher = inject(ModalFlowLauncher);
  toastService = inject(ToastService);

  isLoading = signal(false);
  filter = signal<WishlistFilter>(WishlistFilter.ALL);
  changeStatusError = signal<string | null>(null);

  skeletonArray = Array.from({ length: 6 }, (_, i) => i);

  deletingWishlistId = signal<string | null>(null);
  wishlistStatusChangingId = signal<string | null>(null);

  filteredWishlists = computed<UserWishlist[]>(() => {
    if (!this.wishlistsStore.wishlists()) return [];

    switch (this.filter()) {
      case WishlistFilter.ALL:
        return this.wishlistsStore.wishlists()!;
      case WishlistFilter.DRAFT:
        return this.wishlistsStore
          .wishlists()!
          .filter((wishlist) => wishlist.status === WishlistStatus.DRAFT);
      case WishlistFilter.PUBLISHED:
        return this.wishlistsStore
          .wishlists()!
          .filter((wishlist) => wishlist.status === WishlistStatus.PUBLISHED);
      case WishlistFilter.HIDDEN:
        return this.wishlistsStore
          .wishlists()!
          .filter((wishlist) => wishlist.status === WishlistStatus.HIDDEN);
      case WishlistFilter.WITH_EVENT:
        return this.wishlistsStore.wishlists()!.filter((wishlist) => !!wishlist.event);
      case WishlistFilter.WITHOUT_EVENT:
        return this.wishlistsStore.wishlists()!.filter((wishlist) => !wishlist.event);
      default:
        return this.wishlistsStore.wishlists()!;
    }
  });

  setFilter(newFilter: WishlistFilter) {
    this.filter.set(newFilter);
  }

  addEvent(wishlistId: string) {
    this.openEditWishlistModal(wishlistId, EditWishListStepKey.EVENT);
  }

  async openEditWishlistModal(wishlistId: string, step?: StepOf<ModalFlowKey.EDIT_WISHLIST>) {
    const wishlist = this.wishlistsStore.wishlists()!.find((w) => w.id === wishlistId);

    const { id, slug, owner_id, status, event, gifts } = wishlist!;

    const editWishlistFlowState: EditWishlistFlowState = {
      wishlist: {
        id,
        slug,
        owner_id,
        status,
      },

      event: event,
      gifts: gifts,
    };

    this.wishlistEditorStore.setEditMode(true);
    await this.modalFlowLauncher.openFlow(ModalFlowKey.EDIT_WISHLIST, editWishlistFlowState, step);
  }

  async changeWishlistStatus({ status, id: wishlistId }: { status: WishlistStatus; id: string }) {
    try {
      this.wishlistStatusChangingId.set(wishlistId);
      await this.wishlistsStore.updateWishlistStatus(wishlistId, status);
      this.wishlistStatusChangingId.set(null);

      this.toastService.showToast({
        message:
          status === WishlistStatus.PUBLISHED
            ? 'Вішліст успішно опубліковано'
            : 'Статус списку бажань змінено',
        type: 'success',
      });
    } catch (error: any) {
      this.toastService.showToast({
        message: error?.message || 'Помилка при зміні статусу. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
      console.error('Error publishing wishlist:', error);
    }
  }

  async deleteWishlist(wishlistId: string) {
    try {
      this.deletingWishlistId.set(wishlistId);
      await this.wishlistsStore.deleteWishlist(wishlistId);
      this.deletingWishlistId.set(null);

      this.toastService.showToast({
        message: 'Вішлист успішно видалено',
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      this.toastService.showToast({
        message: 'Помилка при видаленні вішлисту',
        type: 'error',
      });
    }
  }

  async loadWishlists() {
    try {
      this.isLoading.set(true);
      await this.wishlistsStore.loadWishlists();
      this.isLoading.set(false);
    } catch (error) {
      console.error('Error loading wishlists:', error);
      this.toastService.showToast({
        message: 'Помилка при завантаженні списків бажань. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
    }
  }

  ngOnInit() {
    this.loadWishlists();
  }
}
