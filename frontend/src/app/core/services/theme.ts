import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Read the saved theme from localStorage (light by default)
  isDark = signal<boolean>(localStorage.getItem('theme') === 'dark');

  constructor() {
    // Automatically apply the class to the body and save it to localStorage whenever the signal changes
    effect(() => {
      const dark = this.isDark();
      if (dark) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggleTheme() {
    this.isDark.update(val => !val);
  }
}
