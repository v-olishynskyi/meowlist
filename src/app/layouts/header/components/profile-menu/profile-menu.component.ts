import { Component, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DropdownMenuComponent } from '../../../../components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  imports: [RouterLink, DropdownMenuComponent],
})
export class ProfileMenuComponent {
  private readonly router = inject(Router);

  isOpen = signal<boolean>(false);
  logout = output();

  toggleOpen(): void {
    this.isOpen.update((value) => !value);
  }

  goToWishlists(): void {
    this.router.navigate(['/wishlists']);
    this.isOpen.set(false);
  }
}
