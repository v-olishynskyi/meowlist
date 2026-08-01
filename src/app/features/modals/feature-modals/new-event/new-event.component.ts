import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModalFlowKey, NewWishlistEventDraft } from '../../../../components/modal/data/modal.types';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';

type NewEventForm = {
  name: FormControl<NewWishlistEventDraft['name']>;
  description: FormControl<NewWishlistEventDraft['description']>;
  date: FormControl<NewWishlistEventDraft['date']>;
  location: FormControl<NewWishlistEventDraft['location']>;
  coverImage: FormControl<NewWishlistEventDraft['coverImage']>;
};

@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  imports: [ReactiveFormsModule],
})
export class NewEventModal {
  router = inject(Router);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  newEventForm = new FormGroup<NewEventForm>({
    name: new FormControl('', { nonNullable: true }),
    description: new FormControl(''),
    date: new FormControl(new Date().toISOString().split('T')[0]),
    location: new FormControl(''),
    coverImage: new FormControl(''),
  });

  submitForm() {
    console.log('Form submitted:', this.newEventForm.value);
    if (!this.newEventForm.valid) return;

    // this.modalFlowRuntimeStore.getSession(ModalFlowKey.NEW_WISHLIST)?.state.event

    this.router.navigate([], {
      queryParams: {
        flow: 'new-wishlist',
        step: 'edit-wishlist',
      },
    });
  }
}
