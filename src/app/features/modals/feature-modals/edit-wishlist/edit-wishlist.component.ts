import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-wishlist',
  templateUrl: './edit-wishlist.component.html',
  imports: [DecimalPipe],
})
export class EditWishlistModal {
  router = inject(Router);

  gifts = [
    {
      id: '1',
      imageUrl:
        'https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg',
      name: 'Солодка полуниця',
      price: 100,
      status: 'available',
    },
    {
      id: '2',
      imageUrl:
        'https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg',
      name: 'Солодка полуниця',
      price: 150,
      status: 'available',
    },
  ];

  addGift() {
    this.router.navigate([], {
      queryParams: {
        flow: 'new-wishlist',
        step: 'add-gift',
      },
    });
  }
}
