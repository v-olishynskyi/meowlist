import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GiftDraft, ModalFlowKey } from '../../../../components/modal/data/modal.types';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';
import { ModalActionsComponent } from '../../../../components/modal/components/modal-actions.component';

interface NewGiftForm {
  name: FormControl<GiftDraft['name']>;
  description: FormControl<GiftDraft['description']>;
  link: FormControl<GiftDraft['link']>;
  price: FormControl<GiftDraft['price']>;
}

@Component({
  selector: 'app-modal-add-new-gift',
  templateUrl: './add-new-gift.component.html',
  imports: [ReactiveFormsModule, ModalActionsComponent],
})
export class AddNewGiftModal {
  router = inject(Router);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  session = this.modalFlowRuntimeStore.getSession(ModalFlowKey.NEW_WISHLIST);

  previewImageUrl: string = '';

  newGiftForm = new FormGroup<NewGiftForm>({
    name: new FormControl('', { nonNullable: true }),
    description: new FormControl(''),
    link: new FormControl(''),
    price: new FormControl(null),
  });

  submitForm() {
    console.log('Form submitted:', this.newGiftForm.value);
    if (!this.newGiftForm.valid) return;

    const gift: GiftDraft = {
      id: 'name' + Date.now().toString(),
      name: this.newGiftForm.value.name!,
      description: this.newGiftForm.value.description || null,
      link: this.newGiftForm.value.link || null,
      price: this.newGiftForm.value.price || null,
      imageUrl: this.previewImageUrl,
      status: 'draft',
    };

    this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
      ...state,
      gifts: [...state.gifts, gift],
    }));

    this.close();
  }

  onImageSelected(event: Event) {
    const file: File = (event.target as HTMLInputElement).files![0];

    if (file) {
      this.previewImageUrl = URL.createObjectURL(file);
    }
  }

  close() {
    this.router.navigate([], {
      queryParams: {
        flow: 'new-wishlist',
        step: 'edit-wishlist',
      },
    });
  }
}
