import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventDraft, ModalFlowKey } from '../../../../core/modal/modal.types';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../core/modal/modal-flow-runtime.store';
import { ModalActionsComponent } from '../../../../core/modal/modal-actions.component';
import { WishlistEditorStore } from '../../data/wishlist-editor.store';
import { ToastService } from '../../../../core/toast/toast.service';

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
  toastService = inject(ToastService);

  minDate = new Date().toISOString().split('T')[0];

  event = this.wishlistEditorStore.event;
  isEditMode = this.wishlistEditorStore.isEditMode;

  isLoading = signal<boolean>(false);

  eventForm = new FormGroup<EventForm>(
    {
      name: new FormControl(this.event()?.name || '', {
        validators: [Validators.maxLength(100), Validators.required],
      }),
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
    this.isLoading.set(true);

    try {
      const shouldCreateWishlist = !this.isEditMode() && !this.wishlistEditorStore.wishlist();

      if (shouldCreateWishlist) {
        await this.wishlistEditorStore.createWishlist(this.eventForm.get('name')?.value || null);
      }

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
      }

      const shouldDeleteEvent = this.event() && !this.shouldHandleEvent();

      if (shouldDeleteEvent) {
        await this.wishlistEditorStore.deleteEvent();
      }

      const flow = this.isEditMode() ? ModalFlowKey.EDIT_WISHLIST : ModalFlowKey.NEW_WISHLIST;

      const baseUrl = this.router.url.split('?')[0];

      this.router.navigate([baseUrl], {
        queryParams: {
          flow,
          step: 'edit-wishlist',
        },
      });

      this.toastService.showToast({
        type: 'success',
        message: 'Подія успішно оброблена!',
      });
    } catch (error) {
      console.error('Error submitting event form:', error);
      this.toastService.showToast({
        type: 'error',
        message: 'Сталася помилка при обробці події. Будь ласка, спробуйте ще раз.',
      });
    } finally {
      this.isLoading.set(false);
    }
  }
}
