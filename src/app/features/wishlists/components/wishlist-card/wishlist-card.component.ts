import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { UserWishlist } from '../../../../components/modal/data/modal.types';
import { WishlistStatus, WishlistStatusLabels } from '../../../../core/types';
import { WishlistMenuComponent } from './component/wishlist-menu/wishlist-menu.component';
import { WishlistStatusSelectorComponent } from './component/wishlist-status-selector/wishlist-status-selector.component';

@Component({
  selector: 'app-wishlist-card',
  standalone: true,
  imports: [RouterLink, DatePipe, WishlistMenuComponent, WishlistStatusSelectorComponent],
  templateUrl: './wishlist-card.component.html',
  styleUrl: './wishlist-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistCardComponent {
  readonly wishlist = input.required<UserWishlist>();
  readonly deletingWishlistId = input<string | null>();
  readonly wishlistStatusChangingId = input<string | null>();

  readonly addEvent = output<string>();
  readonly edit = output<string>();
  readonly changeStatus = output<{ status: WishlistStatus; id: string }>();
  readonly delete = output<string>();

  protected readonly WishlistStatus = WishlistStatus;
  readonly WishlistStatusLabels = WishlistStatusLabels;
  readonly wishlistStatusKeys = Object.keys(WishlistStatusLabels);
}
