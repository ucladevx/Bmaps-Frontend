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
  private baseUrl = 'http://localhost:4200/api/v2/auth';

  private loggedInSource: BehaviorSubject<boolean>;
  loggedIn$;
  private _loggedIn;

  private userSource: BehaviorSubject<GUser>;
  user$;
  private _user;

  constructor(private http: HttpClient, private router: Router) {
    this.loggedInSource = new BehaviorSubject<boolean>(false);
    this.loggedIn$ = this.loggedInSource.asObservable();
    this.loggedIn$.subscribe(lg => this._loggedIn = lg);

    this.userSource = new BehaviorSubject<GUser>({});
    this.user$ = this.userSource.asObservable();
    this.user$.subscribe(u => this._user = u);

    this.http.get(
      this.baseUrl + '/current'
    ).subscribe(user_data => {
      console.log("USER DATA => ");
      console.log(user_data);
      if (user_data['account'] == undefined) {
        this.loggedInSource.next(false);
        this.userSource.next({});
      } else {
        this.loggedInSource.next(true);
        this.userSource.next({
          id: user_data['account']['id'],
          first_name: user_data['personal_info']['first_name'],
          last_name: user_data['personal_info']['last_name'],
          full_name: user_data['personal_info']['full_name'],
          email: user_data['personal_info']['email'],
          favorites: user_data['app']['favorites']
        })
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
    return this._user.full_name;
  }

  getFirstName(): string {
    return this._user.first_name;
  }

  getLastName(): string {
    return this._user.last_name;
  }

  getEmail(): string {
    return this._user.email;
  }

  isFavorite(event_id): boolean {
    return event_id in this._user.favorites;
  }

  addFavorite(event_id) {
    console.log("Adding favorite");
    if (!this._loggedIn) {
      return;
    }
    console.log("Add favorite POST");

    this.http.post(this.baseUrl + '/events/favorites?eid=' + event_id, {observe: 'response'})
      .subscribe(resp => {
        console.log(resp);
        if (resp.status == 200) {
          this._user.favorites[event_id] = true;
          this.userSource.next(this._user);
        }
      };
  }

  removeFavorite(event_id) {
    if (!this._loggedIn) {
      return;
    }
    this.http.delete(this.baseUrl + '/events/favorites?eid=' + event_id, {observe: 'response'})
      .subscribe(resp => {
        console.log(resp);
        if (resp.status == 200) {
          delete this._user.favorites[event_id];
          this.userSource.next(this._user);
        }
      };
  }
}
