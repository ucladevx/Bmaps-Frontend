import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { GUser } from './user';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// http://localhost:5000/api/v2/auth/current

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currUser: GUser;

  private loggedInSource: BehaviorSubject<boolean>;
  loggedIn$;
  private _loggedIn;

  constructor(private http: HttpClient, private router: Router) {
    this.loggedInSource = new BehaviorSubject<boolean>(false);
    this.loggedIn$ = this.loggedInSource.asObservable();
    this.loggedIn$.subscribe(lg => this._loggedIn = lg);

    this.http.get(
      'http://localhost:4200/api/v2/auth/current'
    ).subscribe(user_data => {
      console.log("USER DATA => ");
      console.log(user_data);
      if (user_data['account'] == undefined) {
        this.loggedInSource.next(false);
      } else {
        this.loggedInSource.next(true);
      }
    });
  }

  login() {
    if (this._loggedIn) {
      return;
    }
    console.log("Logging In");
    let redirect_url = window.location.href;
    window.location.href = 'http://localhost:4200/api/v2/auth/login?redirect=' + encodeURI(redirect_url);
  }

  logout() {
    if (!this._loggedIn) {
      return;
    }
    console.log("Logging Out");
    let redirect_url = window.location.href;
    window.location.href = 'http://localhost:4200/api/v2/auth/logout?redirect=' + encodeURI(redirect_url);
  }

  getFullName(): string {
    return this.currUser.full_name;
  }

  getFirstName(): string {
    return this.currUser.first_name;
  }

  getLastName(): string {
    return this.currUser.last_name;
  }

  getEmail(): string {
    return this.currUser.email;
  }

  isFavorite(event_id): boolean {
    return event_id in this.currUser.favorites;
  }
}
