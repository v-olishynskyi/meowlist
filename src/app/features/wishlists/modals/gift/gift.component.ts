import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GiftDraft } from '../../../../core/modal/modal.types';
import { Router } from '@angular/router';
import { ModalActionsComponent } from '../../../../core/modal/modal-actions.component';
import { WishlistStore } from '../../data/wishlist.store';

interface GiftForm {
  name: FormControl<GiftDraft['name']>;
  description: FormControl<GiftDraft['description']>;
  link: FormControl<GiftDraft['link']>;
  price: FormControl<GiftDraft['price']>;
}

@Component({
  selector: 'app-modal-gift',
  templateUrl: './gift.component.html',
  imports: [ReactiveFormsModule, ModalActionsComponent],
})
export class GiftModal {
  router = inject(Router);
  wishlistStore = inject(WishlistStore);

  previewImageUrl = signal<string>('');

  isSubmitting = signal<boolean>(false);

  newGiftForm = new FormGroup<GiftForm>({
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
      imageUrl: this.previewImageUrl(),
    };

    try {
      this.isSubmitting.set(true);
      await this.wishlistStore.addNewGift(giftData);
      this.close();
    } catch (error) {
      console.error('Error adding new gift:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onImageSelected(event: Event) {
    const file: File = (event.target as HTMLInputElement).files![0];
    try {
      const fullPath = await this.wishlistStore.uploadGiftImage(file);

      this.previewImageUrl.set(fullPath);
    } catch (error) {
      console.error('Error uploading image:', error);
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
