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
  private baseUrl = 'http://localhost:4200/api/v2/auth';

  private loggedInSource: BehaviorSubject<boolean>;
  loggedIn$;
  private _loggedIn;

  constructor(private http: HttpClient, private router: Router) {
    this.loggedInSource = new BehaviorSubject<boolean>(false);
    this.loggedIn$ = this.loggedInSource.asObservable();
    this.loggedIn$.subscribe(lg => this._loggedIn = lg);

    this.http.get(
      this.baseUrl + '/current'
    ).subscribe(user_data => {
      console.log("USER DATA => ");
      console.log(user_data);
      if (user_data['account'] == undefined) {
        this.loggedInSource.next(false);
        this.currUser = undefined;
      } else {
        this.loggedInSource.next(true);
        this.currUser = {
          id: user_data['account']['id'],
          first_name: user_data['personal_info']['first_name'],
          last_name: user_data['personal_info']['last_name'],
          full_name: user_data['personal_info']['full_name'],
          email: user_data['personal_info']['email'],
          favorites: user_data['app']['favorites']
        }
      }
    });
  }

  login() {
    if (this._loggedIn) {
      return;
    }
    console.log("Logging In");
    let redirect_url = window.location.href;
    window.location.href = this.baseUrl + '/login?redirect=' + encodeURI(redirect_url);
  }

  logout() {
    if (!this._loggedIn) {
      return;
    }
    console.log("Logging Out");
    let redirect_url = window.location.href;
    window.location.href = this.baseUrl + '/logout?redirect=' + encodeURI(redirect_url);
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

  addFavorite(event_id) {
    console.log("Adding favorite");
    if (!this._loggedIn) {
      return;
    }
    console.log("Add favorite POST");
    this.http.post(this.baseUrl + '/events/favorites?eid=' + event_id, {});
  }

  removeFavorite(event_id) {
    if (!this._loggedIn) {
      return;
    }
    this.http.delete(this.baseUrl + '/events/favorites?eid=' + event_id, {});
  }
}
