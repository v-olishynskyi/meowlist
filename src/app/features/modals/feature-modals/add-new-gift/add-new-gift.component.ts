import { Component, inject } from '@angular/core';
import { ModalBaseContainer } from '../../components/modal-container/modal-container.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-add-new-gift',
  templateUrl: './add-new-gift.component.html',
  imports: [ModalBaseContainer],
})
export class AddNewGiftModal {}
