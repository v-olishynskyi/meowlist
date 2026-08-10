import { Component, ElementRef, input, viewChild } from '@angular/core';

export type DropdownMenuPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.css',
})
export class DropdownMenuComponent {
  private static nextId = 0;

  readonly position = input<DropdownMenuPosition>('bottom-end');

  readonly ariaLabel = input('Відкрити меню');

  readonly closeOnItemClick = input(true);

  readonly triggerClass = input('btn btn-circle btn-ghost btn-sm');

  readonly popoverId = `dropdown-menu-${DropdownMenuComponent.nextId++}`;

  private readonly popover = viewChild.required<ElementRef<HTMLElement>>('popover');

  close(): void {
    const popover = this.popover().nativeElement;

    if (popover.matches(':popover-open')) {
      popover.hidePopover();
    }
  }

  onContentClick(event: MouseEvent): void {
    if (!this.closeOnItemClick()) {
      return;
    }

    const target = event.target as HTMLElement;

    const menuItem = target.closest('button, a, [role="menuitem"]');

    if (!menuItem) {
      return;
    }

    this.close();
  }
}
