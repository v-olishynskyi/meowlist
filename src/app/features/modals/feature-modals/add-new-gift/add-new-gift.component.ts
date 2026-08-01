import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GiftDraft } from '../../../../components/modal/data/modal.types';
import { Router } from '@angular/router';

interface NewGiftForm {
  name: FormControl<GiftDraft['name']>;
  description: FormControl<GiftDraft['description']>;
  link: FormControl<GiftDraft['link']>;
  price: FormControl<GiftDraft['price']>;
  imageUrl: FormControl<GiftDraft['imageUrl']>;
}

@Component({
  selector: 'app-modal-add-new-gift',
  templateUrl: './add-new-gift.component.html',
  imports: [ReactiveFormsModule],
})
export class AddNewGiftModal {
  router = inject(Router);

  newGiftForm = new FormGroup<NewGiftForm>({
    name: new FormControl('', { nonNullable: true }),
    description: new FormControl(''),
    link: new FormControl(''),
    price: new FormControl(null),
    imageUrl: new FormControl(''),
  });

  submitForm() {
    console.log('Form submitted:', this.newGiftForm.value);
  }

  cancel() {
    this.router.navigate([], {
      queryParams: {
        flow: 'new-wishlist',
        step: 'edit-wishlist',
      },
    });
  }

  closeModal() {}
}
