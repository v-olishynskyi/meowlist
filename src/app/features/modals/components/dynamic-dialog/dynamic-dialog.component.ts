import { Component, inject, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dynamic-dialog',
  template: `<ng-container [ngComponentOutlet]="data.currentComponent"></ng-container>`,
  imports: [NgComponentOutlet],
})
export class DynamicDialogComponent {
  data = inject<{ currentComponent: Type<any> }>(MAT_DIALOG_DATA);
}
