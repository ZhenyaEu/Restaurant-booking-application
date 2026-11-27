import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common'; // Для красивого форматирования даты
import { OrdersService, Order } from '../../core/services/orders';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [DatePipe, SpinnerComponent],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);
  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.isLoading.set(true);
    this.ordersService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки заказов:', err);
        this.isLoading.set(false);
      }
    });
  }

  markAsDone(orderId: number) {
    this.ordersService.completeOrder(orderId).subscribe({
      next: (updatedOrder) => {
        // Обновляем статус заказа на экране без перезагрузки
        this.orders.update(list => 
          list.map(o => o.id === updatedOrder.id ? updatedOrder : o)
        );
      },
      error: (err) => console.error('Ошибка обновления статуса:', err)
    });
  }
}
