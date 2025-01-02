import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MongodbService } from 'src/app/Services/mongodb.service';
import { ProductinfoService } from 'src/app/Services/productinfo.service';

@Component({
  selector: 'app-individual',
  templateUrl: './individual.component.html',
  styleUrls: ['./individual.component.css']
})
export class IndividualComponent {

  progressBarValue: number = 0; // Progress bar value
  showProgressBar: boolean = true;
  item: any = null;
  title: any = "my text";

  constructor(private router: Router,private productService: ProductinfoService, private mongodbService: MongodbService){
    if(this.productService.currentPage === "wishlist"){
    this.productService.setActiveRoute("wishlist");
    }
  }

  ngOnInit(): void {
    console.log('Individual component loaded');
    if(this.productService.currentPage === "results"){
    this.item = this.productService.getCurrentItem();
    console.log('Item:', this.item);
    this.title = this.productService.getProductTitle();
    }else if(this.productService.currentPage === "wishlist"){
      this.item = this.productService.getwishlistItem();
      this.title = this.productService.getwishlistProductTitle();
    }
    this.oncallperform();
  }

  async oncallperform(): Promise<void> {
    console.log('your are on ',this.productService.currentPage);
    if(this.productService.currentPage === "results" && !this.productService.detailButtonClickedResult){
      this.startProgressBar();
      await this.productService.getProductDetails();
      await this.productService.getSimilarItems();
      await this.productService.getProductImages();
    }
    else if(this.productService.currentPage === "wishlist" && !this.productService.detailButtonClickedWishlist){
      this.startProgressBar();
      await this.productService.getProductDetailsWishlist();
      await this.productService.getSimilarItemsWishlist();
      await this.productService.getProductImagesWishlist();
    }
    this.stopProgressBar();
    this.router.navigate(['/individual/product']);
    
  }
  startProgressBar(): void {
    this.showProgressBar = true;
    this.progressBarValue = 50; // You can set this to any initial value or even animate it over time
  }

  stopProgressBar(): void {
    this.showProgressBar = false;
    this.progressBarValue = 0;
  }

  backbutton(): void {
    if(this.productService.currentPage === "results"){
    this.router.navigate(['/results']);
    }else if(this.productService.currentPage === "wishlist"){
      this.router.navigate(['/wishlist']);
    }
  }

  ngOnDestroy(): void {
    if(this.productService.currentPage === "results"){
    this.productService.detailButtonClickedResult = true;
    }else if(this.productService.currentPage === "wishlist"){
    this.productService.detailButtonClickedWishlist = true;
    this.productService.setActiveRoute("");
    }
  }

  toogleIcon(): void {
    console.log('Initial:', this.item.isInWishlist);
    if (!this.item.isInWishlist) {
      // console.log('In the IF block - Before Change:', item.isInWishlist);
      this.item.isInWishlist = !this.item.isInWishlist;
      // console.log('In the IF block - After Change:', item.isInWishlist); // Reflect the changes in the service
      this.mongodbService.updateWishlistItemsSet([this.item]);
      this.mongodbService.addDocument(this.item).subscribe({
        next: ()=>{
          console.log('Document added to wishlist');
        }
      });

    } else {
      // console.log('In the ELSE block - Before Change:', item.isInWishlist);
      this.item.isInWishlist = !this.item.isInWishlist;
      if(this.productService.currentPage === "wishlist"){
        this.productService.setwishlistItemId("");
      }
      // console.log('In the ELSE block - After Change:', item.isInWishlist);
      this.mongodbService.removeFromWishlist(this.item.itemId[0]);
      this.mongodbService.removeDocument(this.item.itemId[0]).subscribe({
        next:()=>{
          console.log('Document removed from wishlist');
        }
      });
    }
  }
  facebookShare(): void {
    let item = null;
    if(this.productService.currentPage === "results"){
      item = this.productService.facebookItemResults;
    }else if(this.productService.currentPage === "wishlist"){
      item = this.productService.facebookItemWishlist;
    }
    const productName = encodeURIComponent(item.Title); // Replace with actual product name property
    const price = encodeURIComponent(item.CurrentPrice.Value); // Replace with actual product price property
    const link = encodeURIComponent(item.ViewItemURLForNaturalSearch); // Replace with actual product link property
    const shareText = `Buy ${productName} at ${price} from LINK below.`;
    const facebookShareUrl = `https://www.facebook.com/dialog/share?app_id=3181652005476138&display=popup&href=${link}&redirect_uri=${link}&quote=${shareText}`;
    console.log('Facebook share URL:', facebookShareUrl);
    window.open(facebookShareUrl, '_blank');
  }


}
