import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDishDialog } from './edit-dish-dialog';

describe('EditDishDialog', () => {
  let component: EditDishDialog;
  let fixture: ComponentFixture<EditDishDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDishDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditDishDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
