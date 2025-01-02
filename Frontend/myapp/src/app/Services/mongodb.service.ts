import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongodbService {
  private baseUrl: string = 'https://angularbackend-404409.wl.r.appspot.com'; // Update this if your server is on a different domain or port
  private _wishlistItems: Set<string> = new Set();

  constructor(private http: HttpClient) { }

  addDocument(document: any): Observable<any> {
    const myparams = {document: JSON.stringify(document)};
    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.get(`${this.baseUrl}/addDoc`, {params: myparams, headers: headers });
  }

  getAllDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAllDocs`);
  }

  checkDocumentExists(itemId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/checkDoc`, {
      params: { itemId: itemId }
    });
  }
  
  removeDocument(itemId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/removeDoc`, {
      params: { itemId: itemId }
    });
  }

  fetchAndUpdateWishlistItems(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        this.http.get<any[]>(`${this.baseUrl}/getAllDocs`).subscribe(
            items => {
                const itemIds = items.map((item: any) => item.itemId[0]);
                this._wishlistItems = new Set(itemIds);
                resolve();  // resolve the promise when the data is fetched and processed
            }
        );
    });
  }
  getWishlistItemsSet(): Set<any> {
    console.log('getWishlistItemsSet',this._wishlistItems);
    return new Set(this._wishlistItems); 
  }

  // Setter for the set
  updateWishlistItemsSet(items: any[]): void {
    console.log('before update', [...this._wishlistItems]);
    const newItems = items.map(item => item.itemId[0]);
    newItems.forEach(item => this._wishlistItems.add(item));
    console.log('after update', [...this._wishlistItems]);
  }

  removeFromWishlist(itemId: any): void {
    console.log('before delete',[...this._wishlistItems]);
    this._wishlistItems.delete(itemId);
    console.log('after delete',[...this._wishlistItems]);
  }

}
