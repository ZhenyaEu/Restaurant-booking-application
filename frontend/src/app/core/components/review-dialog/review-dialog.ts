import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RestaurantsService, Review } from '../../services/restaurants';

export interface ReviewDialogData {
  restaurantId: number;
  restaurantName: string;
  existingReview?: Review; // If the user already left a review, pass it for editing
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './review-dialog.html',
  styleUrl: './review-dialog.scss'
})
export class ReviewDialogComponent {
  private fb = inject(FormBuilder);
  private restaurantsService = inject(RestaurantsService);
  private dialogRef = inject(MatDialogRef<ReviewDialogComponent>);
  public data: ReviewDialogData = inject(MAT_DIALOG_DATA);

  stars = [ 1, 2, 3, 4, 5 ];
  selectedRating = signal<number>(this.data.existingReview?.rating || 5);
  hoverRating = signal<number>(0);

  reviewForm: FormGroup = this.fb.group({
    comment: [this.data.existingReview?.comment || '', [Validators.required, Validators.minLength(5)]]
  });

  setRating(star: number) {
    this.selectedRating.set(star);
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      const payload = {
        rating: this.selectedRating(),
        comment: this.reviewForm.get('comment')?.value
      };

      this.restaurantsService.saveReview(this.data.restaurantId, payload).subscribe({
        next: (savedReview) => {
          this.dialogRef.close(savedReview);
        },
        error: (err) => console.error('Error saving review:', err)
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
