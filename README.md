# Angularfire auth with local storage

## Steps for create project

### 1.- Create Angular project

`ng new project-name --routing --style=scss`

### 2.- Connect Firebase to Angular

Create project firebase on 👉 [Firebase console](https://console.firebase.google.com), once you have created the firebase project you will be redirected to the following screen:

![Alt text](https://s3-us-west-2.amazonaws.com/angular-templates/tutorials/firebase-authentication-with-angular/firebase-console.png 'Firebase console')

### 3.- Configure environment

Add credentials in our Angular project configuration file `environment.ts` located in `src/environments/environment.ts`

```
export const environment = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID"
  }
};
```

### 4.- Install dependencies

Install bootstrap, jquery and popper.js

`npm install bootstrap jquery popper.js @fortawesome/fontawesome-free --save`

Configure angular.json, add styles and scripts

```
"styles": [
"./node_modules/bootstrap/dist/css/bootstrap.min.css",
"./node_modules/@fortawesome/fontawesome-free/css/all.css"

],
"scripts": [
"./node_modules/jquery/dist/jquery.min.js",
"./node_modules/popper.js/dist/umd/popper.js",
"./node_modules/bootstrap/dist/js/bootstrap.min.js"
]
```

### 5.- Install AngularFire and Firebase

`npm install firebase @angular/fire --save`

### 6.- Imports on app.module.ts

```
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule
  ]
})
```

### 7.- Create interface called User

`ng g i interfaces/User`

```
export interface User {
  uid?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
}
```

### 8.- Create user service

`ng g s providers/user --skipTests`

In the user service we create two methods `setUserLoggedIn()` to set the user data when it login, adding it to the localStorage of the browser, and `getUserLoggedIn()` to return the localStorage user.

```
import { Injectable } from '@angular/core';
import { User } from '../interfaces/User';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() {}

  // Set data on localStorage
  setUserLoggedIn(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    console.log('saved on localStorage');
  }
  // get data on localStorage
  getUserLoggedIn() {
    if (localStorage.getItem('user')) {
      JSON.parse(localStorage.getItem('user'));
    } else {
      console.log('localStorage empty');
    }
  }
  // Optional: clear localStorage
  clearLocalStorage() {
    localStorage.clear();
  }
}
```

### 9.- Create auth service

`ng g s providers/auth --skipTests`

In the `checkLocalStorage()` method, If localStoge is empty, we call `getDataFromFirebase()` method set user data from firebase on localStorage.

In `getDataFromFirebase()` method will get user data from firebase and saves on user variable. If user is logged into, the user data from firebase is saved on user variable. Once this, we call the `setUserLoggedIn()` method through the `userservice` injected on the contructor and we passed as a parameter the `user` variable.

Option: use `setCustomParameters` to filter login with host domain.

The `loginWithGoogle()` method will do all the logic to start session through firebase.

The `logout()` method will do close session.

Note: Inject `ngZone` to solve error: `Navigation triggered outside Angular zone, did you forget to call 'ngZone.run()'?`, apply when call the router: `this.ngZone.run(() => this.router.navigate(['dashboard'])).then();`.

```
import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { User } from '../interfaces/User';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  user: User;

  constructor(
    private ngZone: NgZone,
    public afAuth: AngularFireAuth,
    private router: Router,
    public userservice: UserService
  ) {
    this.checkLocalStorage();
  }

  /*
   * If localStoge is empty, we call getDataFromFirebase
   * method set user data from firebase on localStorage
   */
  checkLocalStorage() {
    if (!localStorage.getItem('user')) {
      this.getDataFromFirebase();
    } else {
      console.log('localStorage ready!');
    }
  }
  /*
   * Call data from firebase and set data on local storage
   */
  getDataFromFirebase() {
    this.afAuth.authState.subscribe(auth => {
      if (auth) {
        this.user = auth; // save data firebase on user
        console.log('Authenticated');
        this.userservice.setUserLoggedIn(this.user); // set user data from firebase on local storage
      } else {
        console.log('Not authenticated');
      }
    });
  }

  /*
   * login with google
   */
  loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    this.afAuth.auth
      .signInWithPopup(provider)
      .then(data => {
        this.ngZone.run(() => this.router.navigate(['dashboard'])).then();
      })
      .catch(error => {
        console.log(error);
      });

    // setCustomParameters host domain (hd)

    /*
        let provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.setCustomParameters({
          'hd':'domain.edu.mx'
        });
        this.afAuth.auth.signInWithPopup(provider)
        .then((data)=>{
          this.router.navigate(['/dashboard']);
        })
        .catch((error)=>{
          console.log(error)
        });

      */
  }

  /*
   * logout
   */
  logout() {
    this.userservice.clearLocalStorage(); // Optional to clear localStorage
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['login']);
    });
  }
}

```

### 10.- Create guard service

This service help us to protect routes.

### 11.- Create login component

`ng g c components/login --skipTests --inlineStyle`

In the button we add `ngClick` directive with the method `loginWithGoogle()`

login.component.html

```
<div class="container mt-5">
  <div class="row mt-5">
    <div class="col-md-12 text-center">
      Firebase Authentication with Angular
    </div>
  </div>
  <div class="row mt-5">
    <div class="col-md-12 text-center">
      <button type="button" class="btn btn-primary" (click)="loginWithGoogle()">
        <i class="fab fa-google"></i>
      </button>
    </div>
  </div>
</div>
```

`login.component.ts`

Create method `loginWithGoogle()` and through the injected service we call the method created on the service.

On `ngOnInit()` if localstorage have user key, redirected to dashboard.

```
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../providers/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  constructor(private authservice: AuthService, private router: Router) {}

  ngOnInit() {
    /*
      If localstorage have user key, redirected to dashboard
    */
    if (localStorage.getItem('user')) {
      this.router.navigate(['dashboard']);
    }
  }

  loginWithGoogle() {
    this.authservice.loginWithGoogle();
  }
}
```

### 12.- Create dashboard component

`ng g c components/dashboard --skipTests --inlineStyle`

`dashboard.component.hml`

With `user` variable we call properties from interface, in this case `displayName, email, uid and photoURL`, remember that this data was saved on the localstorage and we call it.

The button call method `logout()` with the `ngClick` directive for close session.

```
<div class="container mt-5">
  <div class="row mt-5">
    <div class="col-md-12 text-center">
      <h2>Data from service authentication</h2>
    </div>
  </div>
  <div class="row mt-5 justify-content-center">
    <div class="card" style="width: 20rem;">
      <img
        class="card-img-top"
        src="{{ user.photoURL }}"
        alt="Card image cap"
      />
      <div class="card-body">
        <h5 class="card-title">
          <strong>{{ user.displayName }}</strong>
        </h5>
        <p class="card-text">{{ user.email }}</p>
        <p class="card-text"><strong>UID:</strong> {{ user.uid }}</p>
        <a href="#" class="btn btn-danger" (click)="logout()">
          <i class="fas fa-sign-out-alt"></i> Logout
        </a>
      </div>
    </div>
  </div>
</div>

```

`dashboard.component.ts`

In constructor we injects the `AuthService` for logout session and clear localStorage.

Create `getUserLoggedIn()` method to call data from localSstorage and storage on `user` variable.

```
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../providers/auth.service';
import { UserService } from './../../providers/user.service';
import { User } from 'firebase';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  user: User;
  constructor(
    public authservice: AuthService
  ) {
    this.getUserLoggedIn();
  }

  ngOnInit() {
  }

  getUserLoggedIn() {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  logout() {
    this.authservice.logout();
    console.log('Logged out');
  }
}

```

### 13.- Create routes on `app.routing.module.ts`

```
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [GuardService]
  },
  { path: '**', pathMatch: 'full', redirectTo: 'dashboard' }
];
```

Enable `HashLocationStrategy` with `{useHash: true}`

```
export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash:true});
```

### Finish!!! Run the project

`ng serve --o`

### Preview screenshots

![Alt text](https://i.imgur.com/7YUZtfa.png 'Login Component')

![Alt text](https://pbs.twimg.com/media/DJDyjYeUMAAAZdC.jpg 'Credentials')

![Alt text](https://i.imgur.com/juEbNfP.png 'Dashboard Component')

![Alt text](https://i.imgur.com/mLOMuax.png 'Local Storage')
