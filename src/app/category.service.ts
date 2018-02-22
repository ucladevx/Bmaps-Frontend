import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class CategoryService {
  private apiUrl = "http://www.whatsmappening.io/api/v1";

  constructor(
    private http: HttpClient
  ) { }

  /** GET categories from the server */
  getCategories(): Observable {
    return this.http.get(this.apiUrl);
  }
}
