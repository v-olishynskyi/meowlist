import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserWishlist } from '../../../../../../core/modal/modal.types';

@Component({
  selector: 'app-wishlist-menu',
  templateUrl: './wishlist-menu.component.html',
  imports: [RouterLink],
})
export class WishlistMenuComponent {
  wishlist = input.required<UserWishlist>();
  deletingWishlistId = input<string | null>();

  readonly addEvent = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();

  isDeleting = computed(() => this.deletingWishlistId() === this.wishlist().id);

  isOpen = signal<boolean>(false);
  menuRef = viewChild.required<ElementRef<HTMLDetailsElement>>('wishlistMenu');

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
