import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';

import { CategoryList } from './category';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class CategoryService {
  // private apiUrl = "https://www.mappening.io/api/v1/events/event-categories";
  // private apiUrl = "http://www.mappening.io/api/v2/events/categories";
  private apiUrl = "http://0.0.0.0:5000/api/v2/events/categories";

  constructor(
    private http: HttpClient
  ) { }

  /** GET categories from the server */
  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
