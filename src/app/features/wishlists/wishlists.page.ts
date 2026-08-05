import { Component, computed, inject } from '@angular/core';
import { UtilsService } from '../../shared/utils/utils.service';
import { ModalFlowKey, Wishlist } from '../../components/modal/data/modal.types';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-wishlists-page',
  templateUrl: './wishlists.page.html',
  imports: [RouterLink, DatePipe],
})
export class WishlistsPage {
  ModalFlowKey = ModalFlowKey;
  utilsService = inject(UtilsService);

  filteredWishlists  = computed<any>(() => [])
}
