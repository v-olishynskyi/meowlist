import { Component, inject, isDevMode, signal } from '@angular/core';
import { UtilsService } from '../../shared/utils/utils.service';
import { AuthStore } from '../../core/auth.store';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalStore } from '../../components/modal/data/modal.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [RouterLink, ModalComponent],
})
export class HeaderComponent {
  modalStore = inject(ModalStore);
  authStore = inject(AuthStore);
  IS_DEV = isDevMode();
  utilsService = inject(UtilsService);

  login() {
    this.authStore.signIn().subscribe();
  }
}
