import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventDraft, ModalFlowKey } from '../../../../core/modal/modal.types';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../core/modal/modal-flow-runtime.store';
import { ModalActionsComponent } from '../../../../core/modal/modal-actions.component';
import { WishlistStore } from '../../data/wishlist.store';
import { WishlistEditorStore } from '../../data/wishlist-editor.store';

type EventForm = {
  name: FormControl<EventDraft['name']>;
  description: FormControl<EventDraft['description']>;
  date: FormControl<EventDraft['event_date']>;
  location: FormControl<EventDraft['location']>;
  createEvent: FormControl<boolean>;
};

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
  imports: [ReactiveFormsModule, ModalActionsComponent],
})
export class EventModal {
  log = console.log;
  router = inject(Router);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  wishlistEditorStore = inject(WishlistEditorStore);

  minDate = new Date().toISOString().split('T')[0];

  event = this.wishlistEditorStore.event;
  isEditMode = this.wishlistEditorStore.isEditMode;

  eventForm = new FormGroup<EventForm>(
    {
      name: new FormControl(this.event()?.name || '', { validators: [Validators.maxLength(100)] }),
      description: new FormControl(this.event()?.description || '', {
        validators: [Validators.maxLength(160)],
      }),
      date: new FormControl(this.event()?.event_date || null),
      location: new FormControl(this.event()?.location || ''),
      createEvent: new FormControl(true, {
        nonNullable: true,
      }),
    },
    { updateOn: 'change' },
  );

  shouldHandleEvent(): boolean {
    return (
      (this.isEditMode() && !!this.event()) || this.eventForm.controls.createEvent.value === true
    );
  }

  async submitForm() {
    if (this.shouldHandleEvent()) {
      if (this.eventForm.invalid) {
        this.eventForm.markAllAsTouched();
        return;
      }

      const eventData: EventDraft = {
        name: this.eventForm.get('name')?.value || null,
        description: this.eventForm.get('description')?.value || null,
        event_date: this.eventForm.get('date')?.value || null,
        location: this.eventForm.get('location')?.value || null,
      };

      await this.wishlistEditorStore.handleEvent(eventData);
    } else {
      await this.wishlistEditorStore.handleEvent(null);
    }

    const flow = this.isEditMode() ? ModalFlowKey.EDIT_WISHLIST : ModalFlowKey.NEW_WISHLIST;

    const baseUrl = this.router.url.split('?')[0];

    this.router.navigate([baseUrl], {
      queryParams: {
        flow,
        step: 'edit-wishlist',
      },
    });
  }
}
