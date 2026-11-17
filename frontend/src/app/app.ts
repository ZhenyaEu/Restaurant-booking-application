import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './core/components/navbar/navbar';
import { CartDrawerComponent } from './core/components/cart-drawer/cart-drawer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CartDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('My-project');
}
