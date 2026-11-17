import { Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DishesService, Dish } from '../../core/services/dishes';
import { ButtonComponent } from '../../shared/components/button/button';
import { AuthService } from '../../core/services/auth';
import { EditDishDialogComponent } from '../../core/components/edit-dish-dialog/edit-dish-dialog';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private dishesService = inject(DishesService);
  private dialog = inject(MatDialog);
  public authService = inject(AuthService);
  private cartService = inject(CartService);

  dishes = signal<Dish[]>([]);

  ngOnInit() {
    this.dishesService.getDishes().subscribe({
      next: (data) => this.dishes.set(data),
      error: (err) => console.error('Could not load dishes', err)
    });
  }

  onEdit(dish: Dish) {
    const dialogRef = this.dialog.open(EditDishDialogComponent, {
      data: dish // Передаем текущее блюдо в модальное окно
    });

    // Подписываемся на закрытие окна
    dialogRef.afterClosed().subscribe((updatedDish: Dish | undefined) => {
      if (updatedDish) {
        // Обновляем карточку в сигнале без перезагрузки страницы
        this.dishes.update(list =>
          list.map(item => item.id === updatedDish.id ? updatedDish : item)
        );
      }
    });
  }

  onDelete(id?: number) {
    if (!id) return;

    this.dishesService.deleteDish(id).subscribe({
      next: () => {
        // Удаляем блюдо из списка на экране
        this.dishes.update(list => list.filter(item => item.id !== id));
      },
      error: (err) => console.error('Ошибка при удалении:', err)
    });
  }

  
  onAddToCart(dish: Dish) {
    this.cartService.addToCart(dish);
  }

}
