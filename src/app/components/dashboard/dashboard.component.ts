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
  constructor(public authservice: AuthService) {
    this.getUserLoggedIn();
  }

  ngOnInit() {}

  getUserLoggedIn() {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  logout() {
    this.authservice.logout();
    console.log('Logged out');
  }
}
