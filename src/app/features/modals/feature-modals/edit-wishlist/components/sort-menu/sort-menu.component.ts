import {
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SortBy } from '../../edit-wishlist.component';

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
})
export class SortMenuComponent implements OnInit {
  SortBy = SortBy;
  isOpen = signal(false);

  onChooseSort = output<SortBy>();

  readonly menuRef = viewChild<ElementRef<HTMLDetailsElement>>('dropdownMenu');

  document = inject(DOCUMENT);

  onSortSelected(sort: SortBy) {
    this.onChooseSort.emit(sort);
    this.isOpen.set(false);
  }

  toggleMenu() {
    this.isOpen.set(!this.isOpen());
  }

  ngOnInit(): void {
    if (this.menuRef()) {
      this.menuRef()?.nativeElement.addEventListener('close', () => {
        this.isOpen.set(false);
      });
    }

    this.document.addEventListener('click', (event: MouseEvent) => {
      this.onClickOutside(event);
    });
  }

  onClickOutside(event: MouseEvent) {
    if (this.menuRef() && !this.menuRef()?.nativeElement?.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
