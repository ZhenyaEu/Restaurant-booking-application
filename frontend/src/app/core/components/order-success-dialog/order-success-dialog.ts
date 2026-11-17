import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-order-success-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="success-modal">
      <div class="check-icon">✓</div>
      <h2>Your order has been submitted!</h2>
    </div>
  `,
  styles: [`
    .success-modal {
      padding: 2rem 2.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .check-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #dcfce7;
      color: #15803d;
      font-size: 1.75rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #0f172a;
    }
  `]
})
export class OrderSuccessDialogComponent {}
