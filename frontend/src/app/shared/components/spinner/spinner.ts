import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  template: `
    <div class="spinner-wrapper">
      <div class="loader"></div>
      @if (message()) {
        <p class="loading-text">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3.5rem 1rem;
      gap: 1rem;
    }

    .loader {
      width: 44px;
      height: 44px;
      border: 4px solid rgba(21, 128, 61, 0.2);
      border-top-color: #15803d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent {
  // Optional text below the spinner
  message = input<string>('Loading data...');
}
