import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { UserWishlist } from '../../../../../../core/modal/modal.types';
import { WishlistStatus, WishlistStatusLabels } from '../../../../../../core/types';

@Component({
  selector: 'app-wishlist-status-selector',
  templateUrl: './wishlist-status-selector.component.html',
})
export class WishlistStatusSelectorComponent implements OnInit {
  wishlist = input.required<UserWishlist>();

  wishlistStatusChangingId = input<string | null>();
  onStatusSelected = output<{ status: WishlistStatus; id: string }>();

  readonly WishlistStatusLabels = WishlistStatusLabels;
  readonly wishlistStatusKeys = Object.keys(WishlistStatusLabels) as WishlistStatus[];

  readonly newStatus = signal<WishlistStatus | null>(null);

  isChangingWishlistStatus = computed(() => this.wishlistStatusChangingId() === this.wishlist().id);

  isOpen = signal<boolean>(false);
  menuRef = viewChild.required<ElementRef<HTMLDetailsElement>>('wishlistStatusMenu');

  onChangeStatusClicked(status: WishlistStatus): void {
    this.newStatus.set(status);
    this.onStatusSelected.emit({ id: this.wishlist().id, status });
  }

  toggleOpen(): void {
    this.isOpen.update((value) => !value);
  }

  ngOnInit(): void {
    const menuEl = this.menuRef().nativeElement;

    if (!menuEl) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuEl.contains(event.target as Node)) {
        this.isOpen.set(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
  }
}
