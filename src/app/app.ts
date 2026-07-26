import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

import { Component, inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { ModalRouterStore } from './features/modals/data/modals.store';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth.store';
import { DialogModule } from '@angular/cdk/dialog';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, DialogModule, MatBottomSheetModule],
})
export class App implements OnInit {
  modalsStore = inject(ModalRouterStore);
  authStore = inject(AuthStore);

  ngOnInit() {
    this.authStore.checkAuth().subscribe();
    this.modalsStore.subscribeToRouteChanges();
  }
}
