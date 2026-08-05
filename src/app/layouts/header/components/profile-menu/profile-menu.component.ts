import {
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  imports: [RouterLink],
})
export class ProfileMenuComponent implements OnInit {
  private readonly routert = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly menuRef = viewChild<ElementRef<HTMLDetailsElement>>('profileMenu');

  isOpen = signal<boolean>(false);
  logout = output();

  toggleOpen(): void {
    this.isOpen.update((value) => !value);
  }

  ngOnInit(): void {
    const menuEl = this.menuRef()?.nativeElement;

    if (menuEl) {
      menuEl.addEventListener('close', () => {
        this.isOpen.set(false);
      });
    }

    this.document.addEventListener('click', this.onClickOutside);
  }

  private onClickOutside = (event: MouseEvent) => {
    const menuEl = this.menuRef()?.nativeElement;

    if (menuEl && !menuEl.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  };

  goToWishlists(): void {
    console.log('Navigating to wishlists...');
    this.routert.navigate(['/wishlists']);
  }
}
