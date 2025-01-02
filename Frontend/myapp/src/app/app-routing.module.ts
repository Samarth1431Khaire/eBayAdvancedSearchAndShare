import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResultsComponent } from './Components/results/results.component';
import { WishlistComponent } from './Components/wishlist/wishlist.component';
import { IndividualComponent } from './Components/individual/individual.component';
import { ProductComponent } from './Components/product/product.component';
import { PhotosComponent } from './Components/photos/photos.component';
import { SellerComponent } from './Components/seller/seller.component';
import { ShippingComponent } from './Components/shipping/shipping.component';
import { SimilarproductComponent } from './Components/similarproduct/similarproduct.component';

const routes: Routes = [
  { path: 'results', component: ResultsComponent },
  { path: 'wishlist', component: WishlistComponent },
  {
    path: 'individual',
    component: IndividualComponent,
    children: [
      { path: 'product', component: ProductComponent },
      { path: 'photos', component: PhotosComponent },
      { path: 'seller', component: SellerComponent },
      { path: 'shipping', component: ShippingComponent },
      { path: 'similarproduct', component: SimilarproductComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
