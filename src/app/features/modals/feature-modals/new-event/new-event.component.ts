import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalFlowKey, EventDraft } from '../../../../components/modal/data/modal.types';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';
import { ModalActionsComponent } from '../../../../components/modal/components/modal-actions.component';
import { WishlistStore } from '../data/wishlist.store';

type NewEventForm = {
  name: FormControl<EventDraft['name']>;
  description: FormControl<EventDraft['description']>;
  date: FormControl<EventDraft['event_date']>;
  location: FormControl<EventDraft['location']>;
};

@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  imports: [ReactiveFormsModule, ModalActionsComponent],
})
export class NewEventModal {
  router = inject(Router);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  wishlistStore = inject(WishlistStore);

  minDate = new Date().toISOString().split('T')[0];

  newEventForm = new FormGroup<NewEventForm>(
    {
      name: new FormControl('', { validators: [Validators.maxLength(100)] }),
      description: new FormControl('', { validators: [Validators.maxLength(160)] }),
      date: new FormControl(null),
      location: new FormControl(''),
    },
    { updateOn: 'change' },
  );

  get name() {
    return this.newEventForm.get('name');
  }

  async submitForm() {
    // if (!this.newEventForm.valid) return;

    const eventData: EventDraft = {
      name: this.newEventForm.get('name')?.value || null,
      description: this.newEventForm.get('description')?.value || null,
      event_date: this.newEventForm.get('date')?.value || null,
      location: this.newEventForm.get('location')?.value || null,
    };

    await this.wishlistStore.handleEvent(eventData);

    this.router.navigate([], {
      // TODO
      queryParams: {
        flow: 'new-wishlist',
        step: 'edit-wishlist',
      },
    });
  }
}
