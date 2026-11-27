import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CartService } from '../../services/cart';
import { OrdersService } from '../../services/orders';
import { OrderSuccessDialogComponent } from '../order-success-dialog/order-success-dialog';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss'
})
export class CartDrawerComponent {
  public cartService = inject(CartService);
  private ordersService = inject(OrdersService);
  private dialog = inject(MatDialog);

  onCheckout() {
    this.ordersService.createOrder().subscribe({
      next: () => {
        // 1. Clear and close the cart
        this.cartService.clearLocalCart();

        // 2. Open the dialog
        const dialogRef = this.dialog.open(OrderSuccessDialogComponent);

        // 3. Automatically close after 2 seconds
        setTimeout(() => {
          dialogRef.close();
        }, 2000);
      },
      error: (err) => console.error('Ошибка оформления заказа:', err)
    });
  }
}
