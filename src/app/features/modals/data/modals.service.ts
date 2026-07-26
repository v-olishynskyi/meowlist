import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Service } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

export enum Modals {}

@Service()
export class ModalService {
  router = inject(Router);
  dialog = inject(Dialog);

  private _bottomSheet = inject(MatBottomSheet);
  private _overlay = inject(Overlay);

  openModal<T>(component: ComponentType<T>) {
    const bottomSheetRef = this._bottomSheet.open(component, {
      backdropClass: 'bg-black/80',
      minHeight: '30%',
      panelClass: ['rounded-t-3xl', 'bg-base-100'],
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });

    bottomSheetRef.afterDismissed().subscribe({
      next: () => {
        this.router.navigate([this.router.url]);
      },
    });
  }

  closeModal() {
    this._bottomSheet.dismiss();
  }
}
