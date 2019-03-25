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
