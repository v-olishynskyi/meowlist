import { Component, inject, Injectable, signal, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from './modals.service';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalRouterStore {
  route = inject(ActivatedRoute);

  private _activeComponent = new BehaviorSubject<Type<any> | null>(null);
  activeComponent$ = this._activeComponent.asObservable();

  modalService = inject(ModalService);

  isLoadingContent = signal(false);

  subscribeToRouteChanges() {
    return this.route.queryParams.pipe(
      tap((queryParams) => {
        console.log('queryParams', queryParams);
        switch (queryParams['action']) {
          case 'auth-otp': {
            this.modalService.openModal(ModalAuthOtpComponent);
          }
        }
      }),
    );
  }

  changeActiveComponent(component: Type<any> | null) {
    this._activeComponent.next(component);
  }
}

@Component({
  selector: 'app-modal-auth-otp',
  template: `<div>dialog works!</div>`,
})
export class ModalAuthOtpComponent {}
