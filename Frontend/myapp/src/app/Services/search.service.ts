import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private _results = new BehaviorSubject<any>([]);  // Using BehaviorSubject to hold results
  public results$ = this._results.asObservable();    // Expose as Observable for components to subscribe

  constructor(private http : HttpClient) { }

  executeSearch(criteria: any): Promise<void> {
    const transformedCriteria = {
      keyword: criteria.keyword,
      buyerpostalcode: criteria.zip,
      maxdistance: criteria.distance,
      freeshipping: criteria.shippingOptions.freeShipping,
      localpickup: criteria.shippingOptions.localPickup,
      condition: this.convertCondition(criteria.conditionStates),
      categoryId: criteria.categoryId
    };
    return new Promise<void>((resolve, reject) => {
      this.http.get<any>(`https://angularbackend-404409.wl.r.appspot.com/search`, { params: transformedCriteria }).subscribe(
        data => {
          if (
            data &&
            data.findItemsAdvancedResponse &&
            data.findItemsAdvancedResponse.length > 0 &&
            data.findItemsAdvancedResponse[0].searchResult &&
            data.findItemsAdvancedResponse[0].searchResult.length > 0 &&
            data.findItemsAdvancedResponse[0].searchResult[0].item &&
            data.findItemsAdvancedResponse[0].searchResult[0].item.length > 0
          ) {
            const items = data.findItemsAdvancedResponse[0].searchResult[0].item;
            const processedItems = items.map((item: any) => ({
              ...item,
              isInWishlist: false,
            }));
            this._results.next(processedItems);  // Update the BehaviorSubject with the new results
            resolve();  // Resolve the promise
          } else {
            this._results.next([]);  // Update the BehaviorSubject with empty results
            resolve();  // Resolve the promise even if there are no results to avoid hanging
          }
        }
      );
    });
  }
  private convertCondition(conditionStates: any): string {
    const conditions = [];
    
    if (conditionStates.New) {
      conditions.push('New');
    }
    if (conditionStates.Used) {
      conditions.push('Used');
    }
    if (conditionStates.Unspecified) {
      conditions.push('Unspecified');
    }
    
    return conditions.join(','); // Convert array to comma-separated string
  }
  setResults(data: any[]) {
    console.log('set results');
    this._results.next(data);
  }

}
