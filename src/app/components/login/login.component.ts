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
