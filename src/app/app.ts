import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { OnInit } from '@angular/core';
import { ModalRouterStore } from './features/modals/data/modals.store';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth.store';
import { ModalService } from './features/modals/data/modals.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, MatDialogModule],
})
export class App implements OnInit {
  modalsService = inject(ModalService);
  authStore = inject(AuthStore);

  ngOnInit() {
    this.authStore.checkAuth().subscribe();
    this.modalsService.subscribeToRouteHandler();
  }
}
