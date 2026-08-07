import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { UserWishlist } from '../../../../components/modal/data/modal.types';
import { WishlistStatus } from '../../../../core/types';
import { WishlistMenuComponent } from './component/wishlist-menu/wishlist-menu.component';

@Component({
  selector: 'app-wishlist-card',
  standalone: true,
  imports: [RouterLink, DatePipe, WishlistMenuComponent],
  templateUrl: './wishlist-card.component.html',
  styleUrl: './wishlist-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistCardComponent {
  readonly wishlist = input.required<UserWishlist>();

  readonly addEvent = output<string>();
  readonly edit = output<string>();
  readonly changeStatus = output<string>();
  readonly remove = output<string>();

  protected readonly WishlistStatus = WishlistStatus;
}
