import { Component, output, signal } from '@angular/core';
import { SortBy } from '../../edit-wishlist.component';
import { DropdownMenuComponent } from '../../../../../../../components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  imports: [DropdownMenuComponent],
})
export class SortMenuComponent {
  SortBy = SortBy;
  isOpen = signal(false);

  onChooseSort = output<SortBy>();

  onSortSelected(sort: SortBy) {
    this.onChooseSort.emit(sort);
    this.isOpen.set(false);
  }

  toggleMenu() {
    this.isOpen.set(!this.isOpen());
  }
}
