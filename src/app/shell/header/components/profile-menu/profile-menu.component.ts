import { Component, ElementRef, OnInit, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  imports: [RouterLink],
})
export class ProfileMenuComponent implements OnInit {
  logout = output();

  isOpen = signal<boolean>(false);
  menuRef = viewChild.required<ElementRef<HTMLDetailsElement>>('profileMenu');

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
