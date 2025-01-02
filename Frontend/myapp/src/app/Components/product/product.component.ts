import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductinfoService } from 'src/app/Services/productinfo.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {

  product: any = null;

  private subscription: Subscription = new Subscription();

  constructor(private productService: ProductinfoService) { }

  ngOnInit(): void {
    if(this.productService.currentPage === "results"){
    this.subscription=this.productService.productDetail$.subscribe((data: any) => {
      if (data && 'Item' in data) {
        this.product = data.Item;
        console.log(this.product);
        this.productService.facebookItemResults = this.product;
      } else {
        console.error("Data format incorrect:", data);
        // Handle this scenario accordingly. Maybe show a user-friendly message or retry the request.
      }
    });
  }
    else if(this.productService.currentPage === "wishlist"){
      console.log('enterd wishlist');
      this.subscription=this.productService.productDetailWishlist$.subscribe((data: any) => {
        if (data && 'Item' in data) {
          this.product = data.Item;
          console.log(this.product);
          this.productService.facebookItemWishlist = this.product;
        } else {
          console.error("Data format incorrect:", data);
          // Handle this scenario accordingly. Maybe show a user-friendly message or retry the request.
        }
      });
    }
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
