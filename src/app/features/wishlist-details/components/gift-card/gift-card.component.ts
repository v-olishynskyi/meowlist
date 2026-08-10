import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Gift } from '../../../../components/modal/data/modal.types';
import { DecimalPipe } from '@angular/common';
import { GiftReservationStatus } from '../../../../core/types';

@Component({
  selector: 'app-gift-card',
  templateUrl: './gift-card.component.html',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftCardComponent {
  protected readonly GiftReservationStatus = GiftReservationStatus;

  canEditGift = input<boolean>();
  gift = input.required<Gift>();
  isGiftReservedByMe = input<boolean>();
  isHandlingReservation = input.required<boolean>();

  deleteGift = output<string>();
  reserveGift = output<string>();
  cancelGiftReservation = output<string>();
}
