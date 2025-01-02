import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MongodbService } from 'src/app/Services/mongodb.service';
import { ProductinfoService } from 'src/app/Services/productinfo.service';
import { SearchService } from 'src/app/Services/search.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent {
  // icon: string = 'remove_shopping_cart';
  wishlistItems: any[] = [];
  totalPrice: string = '0';
  private subscription: Subscription = new Subscription();
  selectedItemId: any = "";

  constructor(private mongodbService: MongodbService,private searchService: SearchService,private router: Router, private productService: ProductinfoService) { 
    this.productService.setActiveRoute("wishlist");
  }

  ngOnInit(): void {
    this.subscription=this.mongodbService.getAllDocuments().subscribe({
      next: (items: any[]) => {
        this.wishlistItems = items;
        this.getTotalPrice();
        this.selectedItemId = this.productService.getwishlistItemId();
      },
      error: (error) => {
        console.error('Error fetching wishlist items:', error);
      }
    });
  }

  removeFromWishlist(item: any): void {
    if(item.itemId[0]==this.selectedItemId){
      this.productService.setwishlistItemId("");
    }
    this.mongodbService.removeFromWishlist(item.itemId[0]);
    this.mongodbService.removeDocument(item.itemId).subscribe({
      next: (response) => {
        console.log('Removed from wishlist:', response);
        const index = this.wishlistItems.findIndex(wishlistItem => wishlistItem.itemId === item.itemId);
        if (index !== -1) {
          this.wishlistItems.splice(index, 1);
          this.getTotalPrice();
        }
      },
      error: (error) => console.error('Error removing from wishlist:', error)
    });
  }

  openImage(url: string): void {
    window.open(url, '_blank');
  }

  truncateTitle(title: string, maxLength: number = 35): string {
    if (title.length <= maxLength) {
      return title;
    }

    let truncated = title.substring(0, maxLength);

    if (title[maxLength] !== ' ') {
      let lastSpaceIndex = truncated.lastIndexOf(' ');
      if (lastSpaceIndex !== -1) {
        truncated = truncated.substring(0, lastSpaceIndex);
      }
    }

    return `${truncated}…`;
  }
  getTotalPrice(): void {
    const total = this.wishlistItems.reduce((sum, item) => {
      if (item && item.sellingStatus && Array.isArray(item.sellingStatus) && item.sellingStatus[0] && item.sellingStatus[0].currentPrice && Array.isArray(item.sellingStatus[0].currentPrice)) {
        const priceValue = item.sellingStatus[0].currentPrice[0]?.__value__;
        const price = priceValue ? parseFloat(priceValue) : 0.0;
        return isNaN(price) ? sum : sum + price;
      }
      return sum;
    }, 0.0);
  
    if (Number.isInteger(total)) {
      this.totalPrice = total.toString();
    } else {
      const decimalPlaces = (total.toString().split('.')[1] || []).length;
      this.totalPrice = total.toFixed(decimalPlaces);
    }
  }
  test():void{
    this.productService.currentPage = "wishlist";
    this.router.navigate(['/individual']);
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.productService.setActiveRoute("");
  }
  titleClick(item:any){
    console.log('Title clicked!',item.itemId[0]);
    this.productService.currentPage = "wishlist";
    this.productService.setwishlistItemId(item.itemId[0]);
    this.productService.setwishlistProductTitle(item.title[0]);
    this.productService.setwishlistItem(item);
    this.productService.detailButtonClickedWishlist = false;
    this.router.navigate(['/individual']);
  }
  isItemIdNull(): boolean {
    return this.productService.getwishlistItemId() === "" ;
  }
}
