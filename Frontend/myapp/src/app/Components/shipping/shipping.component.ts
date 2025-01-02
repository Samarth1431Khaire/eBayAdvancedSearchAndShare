import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductinfoService } from 'src/app/Services/productinfo.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.css']
})
export class ShippingComponent {
  private subscription: Subscription = new Subscription();
  item: any = null;
  constructor(private productService: ProductinfoService) { }

  ngOnInit(): void {
    if(this.productService.currentPage === "results"){
    this.item=this.productService.getCurrentItem();
    console.log(this.item);
  }
    else if(this.productService.currentPage === "wishlist"){
     this.item=this.productService.getwishlistItem();
    }
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
