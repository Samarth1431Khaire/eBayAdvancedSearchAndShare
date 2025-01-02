import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {

  private readonly IPINFO_TOKEN: string = 'b65bb3b1601077';

  constructor(private http : HttpClient) { }

  getZipcodeAutoComplete(zipCode: string){
    return this.http.get<string[]>(`https://angularbackend-404409.wl.r.appspot.com/autocomplete?zipCode=${zipCode}`);
  }

  getCurrentLocationZip(): Observable<string> {
    return this.http.get<any>(`https://ipinfo.io/json?token=${this.IPINFO_TOKEN}`).pipe(
        map((response:any) => response.postal), // We extract the ZIP code (postal) from the response
        catchError(error => {
          console.error('There was an issue fetching the ZIP', error);
          return of(''); // returns an observable with an empty string
      })
    );
}
}
