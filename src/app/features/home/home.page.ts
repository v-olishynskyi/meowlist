import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UtilsService } from '../../shared/utils/utils.service';
import { ModalFlowKey } from '../../components/modal/data/modal.types';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [RouterLink],
})
export class HomePage {
  ModalFlowKey = ModalFlowKey;
  utilsService = inject(UtilsService);
}
