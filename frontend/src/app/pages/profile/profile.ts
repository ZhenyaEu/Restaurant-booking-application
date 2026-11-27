import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    SpinnerComponent
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  profileForm!: FormGroup;
  orders = signal<any[]>([]);
  bookings = signal<any[]>([]);
  isConfirmingDelete = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    const user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', [Validators.required]],
      secondName: [user?.secondName || '', [Validators.required]]
    });

    this.loadHistory();
  }

  loadHistory() {
    this.isLoading.set(true);
    this.authService.getCustomerHistory().subscribe({
      next: (data) => {
        this.orders.set(data.orders);
        this.bookings.set(data.bookings);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load customer history:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSaveProfile() {
    if (this.profileForm.valid) {
      this.authService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully!', 'OK', {
            duration: 2500,
            panelClass: ['cart-snackbar']
          });
        },
        error: (err) => console.error('Error updating profile:', err)
      });
    }
  }

  onDeleteAccount() {
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.snackBar.open('Your account has been deleted.', 'OK', { duration: 3000 });
      },
      error: (err) => console.error('Error deleting account:', err)
    });
  }
}
