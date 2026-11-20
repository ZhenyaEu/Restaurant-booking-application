import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  // Автоматически берем текущий год (2026)
  currentYear: number = new Date().getFullYear();
}
