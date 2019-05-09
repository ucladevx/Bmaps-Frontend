import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { catchError, map, tap } from 'rxjs/operators';
import { CategoryList } from './category';

const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

@Injectable()
export class CategoryService {

  // CONSTRUCTOR

  selectedCategorySource: Subject <any>;
  selectedCategory$;

  constructor(private http: HttpClient) {
    this.selectedCategorySource = new Subject < any > ();
    this.selectedCategory$ = this.selectedCategorySource.asObservable();
  }

  private apiUrl = "https://www.mappening.io/api/v2/events/categories";
  private selectedCategory = "all";

  getSelectedCategory(){
    return this.selectedCategory;
  }

  setSelectedCategory(category: string){
    this.selectedCategory = category;
    this.selectedCategorySource.next(category);
  }

  /** GET categories from the server */
  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

}
