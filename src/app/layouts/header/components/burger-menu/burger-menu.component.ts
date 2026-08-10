import { Component, DOCUMENT, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { AuthStore } from '../../../../core/auth.store';

@Component({
  selector: 'app-burger-menu',
  templateUrl: './burger-menu.component.html',
  imports: [RouterLink],
})
export class BurgerMenuComponent {
  utilsService = inject(UtilsService);
  authStore = inject(AuthStore);

  isOpen = signal<boolean>(false);
  menuRef = viewChild.required<ElementRef<HTMLDetailsElement>>('burgerMenu');

  document = inject(DOCUMENT);

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

    this.document.addEventListener('click', handleClickOutside);
  }
}
