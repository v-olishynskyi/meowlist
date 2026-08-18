import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GiftDraft, ModalFlowKey, ROUTE_INTENTS } from '../../../../core/modal/modal.types';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalActionsComponent } from '../../../../core/modal/modal-actions.component';
import { ToastService } from '../../../../core/toast/toast.service';
import { WishlistEditorStore } from '../../data/wishlist-editor.store';
import { UtilsService } from '../../../../shared/utils/utils.service';

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
  wishlistEditorStore = inject(WishlistEditorStore);
  private toastService = inject(ToastService);
  activatedRoute = inject(ActivatedRoute);

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
      await this.wishlistEditorStore.addNewGift(giftData);

      this.close();

      this.toastService.showToast({
        message: 'Подарунок успішно додано',
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding new gift:', error);
      this.toastService.showToast({
        message: 'Помилка при додаванні подарунка. Будь ласка, спробуйте ще раз.',
        type: 'error',
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onImageSelected(event: Event) {
    const file: File = (event.target as HTMLInputElement).files![0];
    try {
      const publicUrl = await this.wishlistEditorStore.uploadGiftImage(file);

      this.previewImageUrl.set(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  close() {
    const flow = this.wishlistEditorStore.isEditMode()
      ? ModalFlowKey.EDIT_WISHLIST
      : ModalFlowKey.NEW_WISHLIST;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        flow,
        // TODO
        step: 'edit-wishlist',
      },
    });
  }
}
