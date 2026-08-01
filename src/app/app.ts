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

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, MatDialogModule],
})
export class App implements OnInit {
  authStore = inject(AuthStore);
  modalRouteCoordinator = inject(ModalRouteCoordinator);

  ngOnInit() {
    this.authStore.checkAuth().subscribe();
    this.modalRouteCoordinator.subscribeToRouteChanges();
  }
}
