import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { WishlistStore } from '../modals/feature-modals/data/wishlist.store';
import { UtilsService } from '../../shared/utils/utils.service';
import { ModalFlowKey, UserWishlist, Wishlist } from '../../components/modal/data/modal.types';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { WishlistStatus } from '../../core/types';

export enum WishlistFilter {
  ALL = 'all',
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  WITH_EVENT = 'with-event',
  WITHOUT_EVENT = 'without-event',
}

type FilterOptions = {
  key: WishlistFilter;
  label: string;
};

const WishlistFilters: Array<FilterOptions> = [
  { key: WishlistFilter.ALL, label: 'Усі' },
  { key: WishlistFilter.DRAFT, label: 'Чернетки' },
  { key: WishlistFilter.PUBLISHED, label: 'Опубліковані' },
  { key: WishlistFilter.HIDDEN, label: 'Приховані' },
  { key: WishlistFilter.WITH_EVENT, label: 'З подією' },
  { key: WishlistFilter.WITHOUT_EVENT, label: 'Без події' },
];

@Component({
  selector: 'app-wishlists-page',
  templateUrl: './wishlists.page.html',
  imports: [RouterLink, DatePipe],
})
export class WishlistsPage implements OnInit {
  wishlistFilters = WishlistFilters;
  ModalFlowKey = ModalFlowKey;
  utilsService = inject(UtilsService);
  wishlistsStore = inject(WishlistStore);

  filter = signal<WishlistFilter>(WishlistFilter.ALL);

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

  ngOnInit() {
    this.wishlistsStore.loadWishlists();
  }
}
