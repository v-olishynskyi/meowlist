import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { WishlistStore } from '../modals/feature-modals/data/wishlist.store';
import { UtilsService } from '../../shared/utils/utils.service';
import { ModalFlowKey, UserWishlist } from '../../components/modal/data/modal.types';
import { RouterLink } from '@angular/router';
import { WishlistFilter, WishlistFilters, WishlistStatus } from '../../core/types';
import { WishlistCardComponent } from './components/wishlist-card/wishlist-card.component';
import { ToastService } from '../../core/toast.service';

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

  addEvent(wishlistId: string) {}

  editWishlist(wishlistId: string) {}

  async changeWishlistStatus({ status, id: wishlistId }: { status: WishlistStatus; id: string }) {
    this.wishlistStatusChangingId.set(wishlistId);
    await this.wishlistsStore.updateWishlistStatus(wishlistId, status);
    this.wishlistStatusChangingId.set(null);
  }

  async deleteWishlist(wishlistId: string) {
    this.deletingWishlistId.set(wishlistId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await this.wishlistsStore.deleteWishlist(wishlistId);
    this.deletingWishlistId.set(null);
  }

  async ngOnInit() {
    this.isLoading.set(true);
    await this.wishlistsStore.loadWishlists();
    this.isLoading.set(false);
  }
}
