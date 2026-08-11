import { Component, inject, isDevMode, signal } from '@angular/core';
import { UtilsService } from '../../shared/utils/utils.service';
import { AuthStore } from '../../core/auth/auth.store';
import { Router, RouterLink } from '@angular/router';
import { ModalComponent } from '../../core/modal/modal.component';
import { ModalStore } from '../../core/modal/modal.store';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu.component';
import { BurgerMenuComponent } from './components/burger-menu/burger-menu.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [RouterLink, ModalComponent, ProfileMenuComponent, BurgerMenuComponent],
})
export class HeaderComponent {
  router = inject(Router);
  modalStore = inject(ModalStore);
  authStore = inject(AuthStore);
  utilsService = inject(UtilsService);

  isLogouting = signal<boolean>(false);

  openNewWishlistModal() {
    const queryParams = this.utilsService.buildFlowQueryParams(
      this.utilsService.ModalFlowKey.NEW_WISHLIST,
    );

    this.router.navigate([this.router.url], { queryParams });
  }

  async logout() {
    this.isLogouting.set(true);

    try {
      const { error } = await this.authStore.logout();

      if (error) throw error;

      this.router.navigate(['/']);
    } catch (error) {
    } finally {
      this.isLogouting.set(false);
    }
  }
}
