import { Component, inject, input, Type } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-container',
  templateUrl: './modal-container.component.html',
  imports: [],
})
export class ModalBaseContainer {
  modalRef = inject(MatDialogRef<ModalBaseContainer>);
  title = input();
  showBackButton = input<boolean>(false);
  onBackButtonClick = input<(() => void) | null | undefined>();

  closeModal() {
    this.modalRef.close();
  }
}
