import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { notWaiterGuard } from './not-waiter-guard';

describe('notWaiterGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => notWaiterGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
