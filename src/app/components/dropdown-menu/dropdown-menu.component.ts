import {
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  model,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';

// TODO

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
})
export class DropdownMenuComponent implements OnInit {
  document = inject(DOCUMENT);
  isOpen = signal<boolean>(false);

  menuRef = viewChild<ElementRef<HTMLDetailsElement>>('dropdownMenu');

  ngOnInit(): void {
    const menuElement = this.menuRef()?.nativeElement;

    if (menuElement) {
      menuElement.addEventListener('close', () => {
        this.isOpen.set(false);
      });

      menuElement.addEventListener('open', () => {
        this.isOpen.set(true);
      });
    }

    this.document.addEventListener('click', (event: MouseEvent) => {
      this.onClickOutside(event);
    });
  }

  onClickOutside(event: MouseEvent) {
    const menuElement = this.menuRef()?.nativeElement;

    if (menuElement && !menuElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
