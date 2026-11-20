import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DishesService, Dish } from '../../core/services/dishes';
import { ButtonComponent } from '../../shared/components/button/button';
import { AuthService } from '../../core/services/auth';
import { EditDishDialogComponent } from '../../core/components/edit-dish-dialog/edit-dish-dialog';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent, MatDialogModule, MatSnackBarModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private dishesService = inject(DishesService);
  private dialog = inject(MatDialog);
  public authService = inject(AuthService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  dishes = signal<Dish[]>([]);

  searchQuery = signal<string>('');
  sortOrder = signal<'default' | 'asc' | 'desc'>('default');

  // Автоматически пересчитываемый список блюд при каждом изменении поиска или сортировки
  filteredDishes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const order = this.sortOrder();
    
    // 1. Фильтрация по названию
    let result = this.dishes().filter(dish => 
      dish.name.toLowerCase().includes(query)
    );

    // 2. Сортировка по цене
    if (order === 'asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (order === 'desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  });

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

  onDelete(id?: any) {
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
    this.snackBar.open(`"${dish.name}" added to cart`, 'OK', {
      duration: 2000,
      horizontalPosition: 'end',   // Справа внизу (можно поставить 'center')
      verticalPosition: 'bottom',
      panelClass: ['cart-snackbar'] // Кастомный класс для стилизации
    });
  }

}

