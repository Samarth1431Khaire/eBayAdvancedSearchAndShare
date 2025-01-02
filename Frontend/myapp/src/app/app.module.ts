import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { ResultsComponent } from './Components/results/results.component';
import { WishlistComponent } from './Components/wishlist/wishlist.component';
import { IndividualComponent } from './Components/individual/individual.component';
import { ProductComponent } from './Components/product/product.component';
import { PhotosComponent } from './Components/photos/photos.component';
import { ShippingComponent } from './Components/shipping/shipping.component';
import { SellerComponent } from './Components/seller/seller.component';
import { SimilarproductComponent } from './Components/similarproduct/similarproduct.component';
import { NgxPaginationModule } from 'ngx-pagination';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    AppComponent,
    ResultsComponent,
    WishlistComponent,
    IndividualComponent,
    ProductComponent,
    PhotosComponent,
    ShippingComponent,
    SellerComponent,
    SimilarproductComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatInputModule,
    HttpClientModule,
    MatProgressBarModule,
    NgxPaginationModule,
    RoundProgressModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
