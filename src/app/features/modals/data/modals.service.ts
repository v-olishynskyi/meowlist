import { ComponentType } from '@angular/cdk/portal';
import { Component, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import type { MatDialogRef } from '@angular/material/dialog';
import { ModalRouterStore } from './modals.store';
import { AuthStore } from '../../../core/auth.store';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddNewGiftModal } from '../feature-modals/add-new-gift/add-new-gift.component';
import { AuthOtpModal } from '../feature-modals/auth-otp/auth-otp.component';

export enum ModalsAction {
  AUTH_OTP = 'auth-otp',
  NEW_WISHLIST = 'new-wishlist',
}

type ModalParams = { action: string; protected: boolean; component: ComponentType<unknown> };

export const ModalsByAction: Record<ModalsAction, ModalParams> = {
  [ModalsAction.AUTH_OTP]: {
    action: ModalsAction.AUTH_OTP,
    protected: false,
    component: AuthOtpModal,
  },
  [ModalsAction.NEW_WISHLIST]: {
    action: ModalsAction.NEW_WISHLIST,
    protected: true,
    component: AddNewGiftModal,
  },
};

const modalConfig: MatDialogConfig = {
  width: 'calc(100vw - 24px)',
  maxWidth: '420px',
  maxHeight: 'calc(100dvh - 16px)',
  panelClass: 'meowlist-dialog',
};

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);

  private dialogRef = signal<MatDialogRef<unknown> | null>(null);

  private modalsStore = inject(ModalRouterStore);
  private authStore = inject(AuthStore);

  private dialogData = signal<{ currentComponent: ComponentType<unknown> } | null>(null);

  constructor() {
    this.dialog.afterAllClosed.subscribe({
      next: () => {
        this.router.navigateByUrl(this.router.url.split('?')[0]);
        this.modalsStore.changeActiveComponent(null);
      },
    });
  }

  openModal(component: ComponentType<unknown>) {
    this.modalsStore.changeActiveComponent(component);

    const ref = this.dialog.open(component, {
      ...modalConfig,
    });
    this.dialogRef.set(ref);
  }

  changeComponent(component: ComponentType<unknown>) {
    if (this.dialogRef()) {
      this.dialogData.set({ currentComponent: component });
    }
  }

  closeModal() {
    this.dialog.closeAll();
  }

  subscribeToRouteHandler() {
    return this.activatedRoute.queryParams
      .pipe(
        tap((queryParams) => {
          console.log('queryParams', queryParams);

          const action = queryParams['action'] as ModalsAction;
          const modalParams = ModalsByAction[action];

          const state = this.router.currentNavigation()?.extras.state;

          // If no modal params found that means the action is invalid, navigate to the root and return
          if (!modalParams) {
            this.router.navigateByUrl('');
            return;
          }

          if (action === ModalsAction.AUTH_OTP && this.authStore.isAuthenticated()) {
            console.log('User is already authenticated, redirecting to home page');
            this.router.navigateByUrl('');
            return;
          }

          // If the modal is protected and the user is not authenticated, redirect to the auth-otp modal
          if (modalParams.protected && !this.authStore.isAuthenticated()) {
            console.log('User is not authenticated, redirecting to auth-otp modal');
            this.router.navigate([], {
              queryParams: { action: ModalsAction.AUTH_OTP, returnAction: modalParams.action },
              queryParamsHandling: 'merge',
            });
            return;
          }

          if (state?.['closeModal']) {
            this.closeModal();
          }

          this.openModal(modalParams.component);
        }),
      )
      .subscribe();
  }
}
