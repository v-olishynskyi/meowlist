import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserWishlist } from '../../../../../../components/modal/data/modal.types';

@Component({
  selector: 'app-wishlist-menu',
  templateUrl: './wishlist-menu.component.html',
  imports: [RouterLink],
})
export class WishlistMenuComponent {
  wishlist = input.required<UserWishlist>();

  readonly addEvent = output<string>();
  readonly edit = output<string>();
  readonly changeStatus = output<string>();
  readonly remove = output<string>();

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
