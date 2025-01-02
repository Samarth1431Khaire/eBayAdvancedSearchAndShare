import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductinfoService } from 'src/app/Services/productinfo.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent {

  productImages: any[] = [];

  private subscription: Subscription = new Subscription();

  constructor(private productService: ProductinfoService) {}

  ngOnInit(): void {
    if(this.productService.currentPage === "results"){
    this.subscription = this.productService.productImages$.subscribe((data:any)=>{
      if(data){
        this.productImages = data;
        console.log(this.productImages);
      }
      else{
        console.error("Data format incorrect:", data);
      }
    })
  }else if(this.productService.currentPage === "wishlist"){
    this.subscription = this.productService.productImagesWishlist$.subscribe((data:any)=>{
      if(data){
        this.productImages = data;
        // console.log(this.productImages);
      }
      else{
        console.error("Data format incorrect:", data);
      }
    })
  }
  }

  // getImageClass(imagePath: string): string {
  //   const index = this.productImages.indexOf(imagePath);
  //   if (index === 3 || index === 4) {
  //     return 'col-3';
  //   }
  //   if (index === 5) {
  //     return 'col-6';
  //   }
  //   return ''; // default return value
  // }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  openImageInNewTab(url: string): void {
    window.open(url, '_blank');
  }
  

}
