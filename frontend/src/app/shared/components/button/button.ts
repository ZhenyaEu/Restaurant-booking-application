import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  template: `
    <button [class]="variant()">
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.scss'
})
export class ButtonComponent {
  // Use modern signal inputs (available in Angular 17.1+)
  variant = input<'text' | 'primary'>('text'); 
}

