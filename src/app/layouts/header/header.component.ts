import { Component, inject, isDevMode } from '@angular/core';
import { AuthStore } from '../../core/auth.store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [RouterLink],
})
export class HeaderComponent {
  authStore = inject(AuthStore);
  IS_DEV = isDevMode();

  login() {
    this.authStore.signIn().subscribe();
  }
}
