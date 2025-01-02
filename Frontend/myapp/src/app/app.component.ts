import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutocompleteService } from './Services/autocomplete.service';
import { filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SearchService } from './Services/search.service';
import { MongodbService } from './Services/mongodb.service';
import { ProductinfoService } from './Services/productinfo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  searchForm!: FormGroup;
  options: string[] = ['One', 'Two', 'Three']; // autocomplete options
  filteredOptions: string[] = []; // filtered options
  currentZip: string = '';
  progressBarValue: number = 0; // Progress bar value
  showProgressBar: boolean = false;
  isActive: boolean = true;

  constructor(private fb: FormBuilder, private service: AutocompleteService, private router: Router, private searchService: SearchService,private mongodbService: MongodbService,private productService: ProductinfoService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.handleZipOptionState(this.searchForm.get('zipOption')?.value);
    this.listenToZipChanges();
    this.fetchCurrentLocationZip();
    this.productService.activeRoute$.subscribe((route)=>{
      if(route === 'wishlist'){
        this.isActive = false;
      }else{
        this.isActive = true;
      }
    })
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      keyword: ['', Validators.required],
      categoryId: ['0'],
      conditionStates: this.fb.group({
        New: [false],
        Used: [false],
        Unspecified: [false]
      }),
      shippingOptions: this.fb.group({
        localPickup: [false],
        freeShipping: [false]
      }),
      distance: [10], // default value is set to 10
      zip: ['',[Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(5), Validators.maxLength(5)]],
      zipOption: ['currentlocation',Validators.required],
    });
    this.searchForm.get('zip')?.valueChanges
    .pipe(
      filter(newZipValue => !!newZipValue) // This will filter out null, undefined, empty string, etc.
    ).subscribe(newZipValue  => {
      this.filterData(newZipValue );
      this.getAutocompleteZip(newZipValue);
    })
  }

  filterData(enteredData: string){
    if(enteredData){
      this.filteredOptions = this.options.filter(item => {
        return item.toLowerCase().indexOf(enteredData.toLowerCase()) > -1
      })
    }
  }

  async onSubmit(): Promise<void> {
    this.router.navigate(['/']);
    this.startProgressBar();
    this.productService.detailButtonClickedResult = false;
    this.productService.detailButtonClickedWishlist = false;
    this.productService.currentPage = "";
    if(this.searchForm.get('zipOption')?.value === 'currentlocation'){
      this.searchForm.value.zip = this.getCurrentLocationZip();
    }
    console.log(this.searchForm.value);
    await this.searchService.executeSearch(this.searchForm.value);
    await this.mongodbService.fetchAndUpdateWishlistItems();
    this.stopProgressBar();
    this.router.navigate(['/results']);
  }

  onReset(event:any): void {
    event.preventDefault();
    this.searchForm.reset({
      keyword: '', 
      categoryId: '0',
      conditionStates: {
        New: false,
        Used: false,
        Unspecified: false
      },
      shippingOptions: {
        localPickup: false,
        freeShipping: false
      },
      distance: 10,
      zip:'',
      zipOption: 'currentlocation',
    });
    this.filteredOptions = [...this.options];
    this.productService.setItemId("");
    this.productService.setwishlistItemId("");
    this.stopProgressBar();
    this.router.navigate(['/']);
  }

  getCurrentLocationZip(): string {
    console.log('Using ZIP from IP:', this.currentZip);
    return this.currentZip;  
  }
  private listenToZipChanges(): void {
    this.searchForm.get('zipOption')?.valueChanges.subscribe((value) => {
      if (value === 'currentlocation') {
        this.searchForm.get('zip')?.setValue('');
        this.searchForm.get('zip')?.disable();
      }
      else if (value === 'other') {
        this.searchForm.get('zip')?.enable();
        this.searchForm.get('zip')?.markAsTouched();
      }
    });
  }
  isZipError(): boolean {
    return this.searchForm.get('zipOption')?.value === 'other' && !this.searchForm.get('zip')?.value;
  }

  getAutocompleteZip(newZipValue: string): void{
    this.service.getZipcodeAutoComplete(newZipValue).subscribe(response => {
      this.options = response;
      this.filteredOptions = response;
    })
  }
  private handleZipOptionState(value: any): void {
    if (value === 'currentlocation') {
      this.searchForm.get('zip')?.setValue('');
      this.searchForm.get('zip')?.disable();
    }
    else if (value === 'other') {
      this.searchForm.get('zip')?.enable();
      this.searchForm.get('zip')?.markAsTouched();
    }
  }
  fetchCurrentLocationZip(): void {
    this.service.getCurrentLocationZip().subscribe(zip1 => {
        this.currentZip = zip1;
    });
  }
  startProgressBar(): void {
    this.showProgressBar = true;
    this.progressBarValue = 50; // You can set this to any initial value or even animate it over time
  }

  stopProgressBar(): void {
    this.showProgressBar = false;
    this.progressBarValue = 0;
  }
  isWishlistRoute() {
    return this.router.url.includes('/wishlist');
  }
}