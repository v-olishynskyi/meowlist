import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventDraft } from '../../../../../components/modal/data/modal.types';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../../components/modal/data/modal-flow-runtime.store';
import { ModalActionsComponent } from '../../../../../components/modal/components/modal-actions.component';
import { WishlistStore } from '../../data/wishlist.store';

type EventForm = {
  name: FormControl<EventDraft['name']>;
  description: FormControl<EventDraft['description']>;
  date: FormControl<EventDraft['event_date']>;
  location: FormControl<EventDraft['location']>;
  shouldCreateEvent: FormControl<boolean>;
};

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  imports: [ReactiveFormsModule, ModalActionsComponent],
})
export class EventModal {
  log = console.log;
  router = inject(Router);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  wishlistStore = inject(WishlistStore);

  minDate = new Date().toISOString().split('T')[0];

  eventForm = new FormGroup<EventForm>(
    {
      name: new FormControl('', { validators: [Validators.maxLength(100)] }),
      description: new FormControl('', { validators: [Validators.maxLength(160)] }),
      date: new FormControl(null),
      location: new FormControl(''),
      shouldCreateEvent: new FormControl(true, {
        nonNullable: true,
      }),
    },
    { updateOn: 'change' },
  );

  get shouldCreateEvent() {
    return this.eventForm.get('shouldCreateEvent')?.value;
  }

  async submitForm() {
    const eventData: EventDraft = {
      name: this.eventForm.get('name')?.value || null,
      description: this.eventForm.get('description')?.value || null,
      event_date: this.eventForm.get('date')?.value || null,
      location: this.eventForm.get('location')?.value || null,
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
