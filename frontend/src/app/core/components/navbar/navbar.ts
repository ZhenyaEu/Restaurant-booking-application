import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Импортируем Dialog

import { ButtonComponent } from '../../../shared/components/button/button';
import { AuthService } from '../../services/auth';
import { RegisterDialogComponent } from '../register-dialog/register-dialog';
import { LoginDialog } from '../login-dialog/login-dialog';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonComponent, RouterLink, RouterLinkActive, MatDialogModule], 
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  logoUrl = signal<string>('');
  
  private http = inject(HttpClient);
  public authService = inject(AuthService); // Делаем public, чтобы использовать в HTML
  private dialog = inject(MatDialog);
  public cartService = inject(CartService)

  ngOnInit() {
    this.http.get<{ logoUrl: string }>('http://localhost:3000/api/config')
      .subscribe({
        next: (response) => this.logoUrl.set(response.logoUrl),
        error: () => this.logoUrl.set('https://angular.dev')
      });
  }

  openLogin() {
    this.dialog.open(LoginDialog);
  }

  openRegister() {
    this.dialog.open(RegisterDialogComponent);
  }

  onLogout() {
    this.authService.logout();
  }
}
