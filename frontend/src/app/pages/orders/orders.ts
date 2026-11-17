import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common'; // Для красивого форматирования даты
import { OrdersService, Order } from '../../core/services/orders';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);
  orders = signal<Order[]>([]);

  ngOnInit() {
    this.ordersService.getOrders().subscribe({
      next: (data) => this.orders.set(data),
      error: (err) => console.error('Ошибка загрузки заказов:', err)
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
