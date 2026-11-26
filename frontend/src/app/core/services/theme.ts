import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Читаем сохраненную тему из localStorage (по умолчанию светлая)
  isDark = signal<boolean>(localStorage.getItem('theme') === 'dark');

  constructor() {
    // Автоматически применяем класс к body и сохраняем в localStorage при каждом изменении сигнала
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
