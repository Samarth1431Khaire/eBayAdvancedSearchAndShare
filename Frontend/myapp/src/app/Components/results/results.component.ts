import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MongodbService } from 'src/app/Services/mongodb.service';
import { ProductinfoService } from 'src/app/Services/productinfo.service';
import { SearchService } from 'src/app/Services/search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {
  icon: string = 'add_shopping_cart';
  results: any[] = [];  // To store the results
  currentPage: number = 1;
  itemsPerPage: number = 10;
  wishlistItemIds: Set<string> = new Set();
  selectedItemId: any = "";

  private subscription: Subscription = new Subscription();

  constructor(private searchService: SearchService, private mongodbService: MongodbService,private productService: ProductinfoService, private router: Router) { }

  ngOnInit(): void {
    this.wishlistItemIds=this.mongodbService.getWishlistItemsSet();
    this.subscription = this.searchService.results$.subscribe(items =>{
      items.forEach((item:any) => {
        item.isInWishlist = this.wishlistItemIds.has(item.itemId[0]);
      });
      this.results = items;
      this.selectedItemId = this.productService.getItemId();
    });
  }
  

  toogleIcon(item: any): void {
    console.log('Initial:', item.isInWishlist);
    if (!item.isInWishlist) {
      // console.log('In the IF block - Before Change:', item.isInWishlist);
      item.isInWishlist = !item.isInWishlist;
      // console.log('In the IF block - After Change:', item.isInWishlist); // Reflect the changes in the service
      this.mongodbService.updateWishlistItemsSet([item]);
      this.mongodbService.addDocument(item).subscribe({
        next: ()=>{
          console.log('Document added to wishlist');
        }
      });

    } else {
      // console.log('In the ELSE block - Before Change:', item.isInWishlist);
      item.isInWishlist = !item.isInWishlist;
      // console.log('In the ELSE block - After Change:', item.isInWishlist);
      this.mongodbService.removeFromWishlist(item.itemId[0]);
      this.mongodbService.removeDocument(item.itemId[0]).subscribe({
        next:()=>{
          console.log('Document removed from wishlist');
        }
      });
    }
  }

  
  performTitleAction(item:any): void {
    // Your logic here when title is clicked
    console.log('Title clicked!',item.itemId[0]);
    this.productService.currentPage = "results";
    this.productService.setItemId(item.itemId[0]);
    this.productService.setProductTitle(item.title[0]);
    this.productService.setCurrentItem(item);
    this.productService.detailButtonClickedResult = false;
    this.router.navigate(['/individual']);

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
  test():void{
    this.productService.currentPage = "results";
    this.router.navigate(['/individual']);
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  isItemIdNull(): boolean {
    return this.productService.getItemId() === "";
  }

}
