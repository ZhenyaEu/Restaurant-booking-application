import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Dish, DishesService } from '../../services/dishes';

@Component({
  selector: 'app-edit-dish-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './edit-dish-dialog.html',
  styleUrl: './edit-dish-dialog.scss'})
export class EditDishDialogComponent {
  private fb = inject(FormBuilder);
  private dishesService = inject(DishesService);
  private dialogRef = inject(MatDialogRef<EditDishDialogComponent>);
  
  // Получаем данные выбранного блюда, переданные при открытии окна
  public data: Dish = inject(MAT_DIALOG_DATA);

  selectedFile: File | null = null;

  editForm: FormGroup = this.fb.group({
    name: [this.data.name, [Validators.required]],
    description: [this.data.description, [Validators.required]],
    price: [this.data.price, [Validators.required, Validators.min(1)]]
  });

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSave() {
    if (this.editForm.valid && this.data.id) {
      const formData = new FormData();
      formData.append('name', this.editForm.get('name')?.value);
      formData.append('description', this.editForm.get('description')?.value);
      formData.append('price', this.editForm.get('price')?.value);
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.dishesService.updateDish(this.data.id, formData).subscribe({
        next: (updatedDish) => {
          // Закрываем окно и возвращаем обновленное блюдо на главную страницу
          this.dialogRef.close(updatedDish);
        },
        error: (err) => console.error('Ошибка при обновлении:', err)
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
