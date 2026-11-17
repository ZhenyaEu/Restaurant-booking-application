import { Component, DestroyRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { Customer, DishesService } from '../../core/services/dishes';

@Component({
  selector: 'app-admin',
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private fb = inject(FormBuilder);
  private dishesService = inject(DishesService);
  private destroyRef = inject(DestroyRef);
  private formDirective = viewChild.required<FormGroupDirective>('formDirective');
  private successMessageTimer: ReturnType<typeof setTimeout> | null = null;

  customers = signal<Customer[]>([]);
  successMessage = signal('');
  selectedFile: File | null = null;

  dishForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [null, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.destroyRef.onDestroy(() => this.clearSuccessMessageTimer());
    this.dishesService.getCustomers().subscribe({
      next: (data) => this.customers.set(data),
      error: (err) => console.error('Could not load customers', err),
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  onSubmitDish() {
    if (this.dishForm.invalid || !this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('name', this.dishForm.value.name);
    formData.append('description', this.dishForm.value.description);
    formData.append('price', String(this.dishForm.value.price));
    formData.append('image', this.selectedFile);

    this.dishesService.addDish(formData).subscribe({
      next: () => {
        this.showSuccessMessage('Dish added successfully.');
        this.formDirective().resetForm();
        this.selectedFile = null;
      },
      error: (err) => console.error('Could not add dish', err),
    });
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    this.clearSuccessMessageTimer();
    this.successMessageTimer = setTimeout(() => {
      this.successMessage.set('');
      this.successMessageTimer = null;
    }, 3000);
  }

  private clearSuccessMessageTimer() {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
      this.successMessageTimer = null;
    }
  }
}
