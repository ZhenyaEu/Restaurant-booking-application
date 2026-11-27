import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Import Dialog

import { ButtonComponent } from '../../../shared/components/button/button';
import { AuthService } from '../../services/auth';
import { RegisterDialogComponent } from '../register-dialog/register-dialog';
import { LoginDialog } from '../login-dialog/login-dialog';
import { CartService } from '../../services/cart';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonComponent, RouterLink, RouterLinkActive, MatDialogModule], 
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  logoUrl = signal<string>('');
  isMobileMenuOpen = signal<boolean>(false);
  
  private http = inject(HttpClient);
  public authService = inject(AuthService); // Make public so it can be used in HTML
  private dialog = inject(MatDialog);
  public cartService = inject(CartService)
  public themeService = inject(ThemeService);

  ngOnInit() {
    this.http.get<{ logoUrl: string }>('http://localhost:3000/api/config')
      .subscribe({
        next: (response) => this.logoUrl.set(response.logoUrl),
        error: () => this.logoUrl.set('https://angular.dev')
      });
  }

   toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  openLogin() {
    this.closeMobileMenu();
    this.dialog.open(LoginDialog);
  }

  openRegister() {
    this.closeMobileMenu();
    this.dialog.open(RegisterDialogComponent);
  }

  onLogout() {
    this.closeMobileMenu();
    this.authService.logout();
  }
}
