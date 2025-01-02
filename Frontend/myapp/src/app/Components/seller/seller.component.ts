import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductinfoService } from 'src/app/Services/productinfo.service';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css']
})
export class SellerComponent {
  item: any = null;

  private subscription: Subscription = new Subscription();

  constructor(private productService: ProductinfoService) { }

  ngOnInit(): void {
    if(this.productService.currentPage === "results"){
    this.subscription=this.productService.productDetail$.subscribe((data: any) => {
      if (data && 'Item' in data) {
        this.item = data.Item;
        console.log(this.item);
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
          this.item = data.Item;
          console.log(this.item);
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
  processFeedbackScore(feedbackScore: string | number): number {
    return parseInt(feedbackScore as string);
  }

  removeShootingFromString(input: string): string {
    return input.replace('Shooting', '');
  }

}
