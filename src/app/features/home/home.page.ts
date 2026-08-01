import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UtilsService } from '../../shared/utils/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [RouterLink],
})
export class HomePage {
  utilsService = inject(UtilsService);
}
