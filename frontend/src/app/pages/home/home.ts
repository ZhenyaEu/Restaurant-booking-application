import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DishesService, Dish } from '../../core/services/dishes';
import { ButtonComponent } from '../../shared/components/button/button';
import { AuthService } from '../../core/services/auth';
import { EditDishDialogComponent } from '../../core/components/edit-dish-dialog/edit-dish-dialog';
import { CartService } from '../../core/services/cart';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent, MatDialogModule, MatSnackBarModule, FormsModule, SpinnerComponent],
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
  isLoading = signal<boolean>(true);

  searchQuery = signal<string>('');
  sortOrder = signal<'default' | 'asc' | 'desc'>('default');

  // Automatically recalculated dish list whenever search or sorting changes
  filteredDishes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const order = this.sortOrder();
    
    // 1. Filter by name
    let result = this.dishes().filter(dish => 
      dish.name.toLowerCase().includes(query)
    );

    // 2. Sort by price
    if (order === 'asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (order === 'desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  });

  ngOnInit() {
    this.isLoading.set(true);
    this.dishesService.getDishes().subscribe({
      next: (data) => {
        this.dishes.set(data);
        this.isLoading.set(false); // Hide the spinner
      },
      error: (err) => {
        console.error('Could not load dishes', err);
        this.isLoading.set(false);
      }
    });
  }

  onEdit(dish: Dish) {
    const dialogRef = this.dialog.open(EditDishDialogComponent, {
      data: dish // Pass the current dish to the dialog
    });

    // Subscribe to dialog close
    dialogRef.afterClosed().subscribe((updatedDish: Dish | undefined) => {
      if (updatedDish) {
        // Update the card through the signal without reloading the page
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
        // Remove the dish from the on-screen list
        this.dishes.update(list => list.filter(item => item.id !== id));
      },
      error: (err) => console.error('Ошибка при удалении:', err)
    });
  }

  
  onAddToCart(dish: Dish) {
    this.cartService.addToCart(dish);
    this.snackBar.open(`"${dish.name}" added to cart`, 'OK', {
      duration: 2000,
      horizontalPosition: 'end',   // At the lower right (can be set to 'center')
      verticalPosition: 'bottom',
      panelClass: ['cart-snackbar'] // Custom styling class
    });
  }

}

