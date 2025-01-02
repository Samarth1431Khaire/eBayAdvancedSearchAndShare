import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductinfoService } from 'src/app/Services/productinfo.service';

@Component({
  selector: 'app-similarproduct',
  templateUrl: './similarproduct.component.html',
  styleUrls: ['./similarproduct.component.css']
})
export class SimilarproductComponent {
  results:any[]=[];
  originalResults: any[] = [];
  sortForm!: FormGroup;
  displayLimit = 5;
  private subscription: Subscription = new Subscription();

  constructor(private productService: ProductinfoService,private fb: FormBuilder) { }

  ngOnInit(): void {
    if(this.productService.currentPage === "results"){
      this.subscription=this.productService.similarItems$.subscribe((data:any)=>{
        console.log(data);
        if(data && data.getSimilarItemsResponse && data.getSimilarItemsResponse.itemRecommendations && data.getSimilarItemsResponse.itemRecommendations.item) {
          this.results = data.getSimilarItemsResponse.itemRecommendations.item;
          this.originalResults = [...this.results];
          // console.log(this.results);
        } else {
          console.error("Data format incorrect or no items found:");
        }
      })
    }
    else if(this.productService.currentPage === "wishlist"){
      this.subscription=this.productService.similarItemsWishlist$.subscribe((data:any)=>{
        console.log(data);
        if(data && data.getSimilarItemsResponse && data.getSimilarItemsResponse.itemRecommendations && data.getSimilarItemsResponse.itemRecommendations.item) {
          this.results = data.getSimilarItemsResponse.itemRecommendations.item;
          this.originalResults = [...this.results];
          // console.log(this.results);
        } else {
          console.error("Data format incorrect or no items found:");
        }
      })
    }
    this.sortForm = this.fb.group({
      sortCategory: ['default'],
      sortOrder: {value: 'ascending', disabled: true}
    });
    // Listen for changes to the sortCategory control
    this.sortForm.get('sortCategory')?.valueChanges.subscribe(value => {
      if (value === 'default') {
        this.sortForm.get('sortOrder')?.disable();
      } else {
        this.sortForm.get('sortOrder')?.enable();
      }
      this.sortResults();
    });
    this.sortForm.get('sortOrder')?.valueChanges.subscribe(value => {
      this.sortResults();
    });
  }
  getDaysFromTimeLeft(timeLeft: string): number {
    if (typeof timeLeft !== 'string') return 0;
    const startIdx = timeLeft.indexOf('P') + 1;
    const endIdx = timeLeft.indexOf('D');
    const days = timeLeft.substring(startIdx, endIdx);
    return days ? parseInt(days, 10) : 0;
  }

  sortResults(): void {
    // console.log('valled');
    const sortCategory = this.sortForm.get('sortCategory')?.value;
    const sortOrder = this.sortForm.get('sortOrder')?.value;

    let getValue: (product: any) => any = () => {};

    if (sortCategory === 'default') {
      // Restore original order
      this.results = [...this.originalResults];
      return;
    }

    // Define the getValue function based on sortCategory
    if (sortCategory === 'productName') {
      getValue = (product: any) => product.title;
    } 
    else if (sortCategory === 'price') {
      getValue = (product: any) => parseFloat(product.buyItNowPrice.__value__);
    } 
    else if (sortCategory === 'shippingCost') {
      getValue = (product: any) => parseFloat(product.shippingCost.__value__);
    }
    else if (sortCategory === 'daysLeft') {
      getValue = (product: any) => this.getDaysFromTimeLeft(product.timeLeft);
    }

    if (!getValue) {
      console.error("sortCategory provided is not valid:", sortCategory);
      return;
  }

    // Sort based on sortCategory and sortOrder
    this.results = [...this.results.sort((a: any, b: any) => {
      const valueA = getValue(a);
      const valueB = getValue(b);
   
      if (sortOrder === 'descending') {
        return (valueA > valueB) ? -1 : ((valueA < valueB) ? 1 : 0);
    } else { // Treat any other sortOrder value as 'ascending'
        return (valueA > valueB) ? 1 : ((valueA < valueB) ? -1 : 0);
    }    
   })];
  //  console.log(this.results);
  }
  toggleDisplayLimit() {
    if (this.displayLimit === 5) {
      this.displayLimit = this.results.length; // Show all results
    } else {
      this.displayLimit = 5; // Show only first 10 results
    }
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
