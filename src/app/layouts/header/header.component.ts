import { Component, inject, isDevMode, signal } from '@angular/core';
import { UtilsService } from '../../shared/utils/utils.service';
import { AuthStore } from '../../core/auth.store';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalStore } from '../../components/modal/data/modal.store';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu.component';
import { BurgerMenuComponent } from './components/burger-menu/burger-menu.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [RouterLink, ModalComponent, ProfileMenuComponent, BurgerMenuComponent],
})
export class HeaderComponent {
  modalStore = inject(ModalStore);
  authStore = inject(AuthStore);
  utilsService = inject(UtilsService);

  isLogouting = signal<boolean>(false);

  async logout() {
    this.isLogouting.set(true);

    try {
      const { error } = await this.authStore.logout();

      if (error) throw error;
    } catch (error) {
      console.log('Logout error', error);
    } finally {
      this.isLogouting.set(false);
    }
  }
}
