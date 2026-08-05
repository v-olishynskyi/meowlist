import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GiftDraft, ModalFlowKey } from '../../../../components/modal/data/modal.types';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';
import { ModalActionsComponent } from '../../../../components/modal/components/modal-actions.component';
import { WishlistStore } from '../data/wishlist.store';

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
  wishlistStore = inject(WishlistStore);

  previewImageUrl: string = '';

  newGiftForm = new FormGroup<NewGiftForm>({
    name: new FormControl('', { nonNullable: true }),
    description: new FormControl(''),
    link: new FormControl(''),
    price: new FormControl(null),
  });

  async submitForm() {
    if (!this.newGiftForm.valid) return;

    const giftData: GiftDraft = {
      name: this.newGiftForm.get('name')?.value!,
      description: this.newGiftForm.get('description')?.value || null,
      link: this.newGiftForm.get('link')?.value || null,
      price: this.newGiftForm.get('price')?.value || null,
      imageUrl: this.previewImageUrl,
    };

    this.wishlistStore.addNewGift(giftData);

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
