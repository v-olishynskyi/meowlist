import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalsAction } from '../modals/data/modals.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [RouterLink],
})
export class HomePage {
  ModalsAction = ModalsAction;
}
