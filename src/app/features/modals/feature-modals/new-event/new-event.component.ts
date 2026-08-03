import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalFlowKey, EventDraft } from '../../../../components/modal/data/modal.types';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';
import { ModalActionsComponent } from '../../../../components/modal/components/modal-actions.component';

type NewEventForm = {
  name: FormControl<EventDraft['name']>;
  description: FormControl<EventDraft['description']>;
  date: FormControl<EventDraft['date']>;
  location: FormControl<EventDraft['location']>;
  coverImage: FormControl<EventDraft['coverImage']>;
};

@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  imports: [ReactiveFormsModule, ModalActionsComponent],
})
export class NewEventModal {
  router = inject(Router);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  minDate = new Date().toISOString().split('T')[0];

  newEventForm = new FormGroup<NewEventForm>(
    {
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { validators: [Validators.maxLength(160)] }),
      date: new FormControl(new Date().toISOString().split('T')[0]),
      location: new FormControl(''),
      coverImage: new FormControl(''),
    },
    { updateOn: 'change' },
  );

  submitForm() {
    if (!this.newEventForm.valid) return;

    this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
      ...state,
      event: {
        ...state.event,
        ...this.newEventForm.value,
      },
    }));

    this.router.navigate([], {
      // TODO
      queryParams: {
        flow: 'new-wishlist',
        step: 'edit-wishlist',
      },
    });
  }
}
