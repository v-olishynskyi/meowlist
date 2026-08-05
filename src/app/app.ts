import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth.store';
import { ModalRouteCoordinator } from './components/modal/data/modal-route-coordinator';
import { registerLocaleData } from '@angular/common';
import localeUa from '@angular/common/locales/uk';

registerLocaleData(localeUa);

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, MatDialogModule],
})
export class App implements OnInit {
  authStore = inject(AuthStore);
  modalRouteCoordinator = inject(ModalRouteCoordinator);

  async ngOnInit() {
    this.modalRouteCoordinator.subscribeToRouteChanges();
    this.authStore.checkAuth();
  }
}
