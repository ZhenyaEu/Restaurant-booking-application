import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Admin } from './pages/admin/admin';
import { RestaurantsComponent } from './pages/restaurants/restaurants';
import { RestaurantDetailComponent } from './pages/restaurant-detail/restaurant-detail';
import { adminGuard } from './core/guards/admin-guard';
import { OrdersComponent } from './pages/orders/orders';
import { waiterGuard } from './core/guards/waiter-guard';
import { notWaiterGuard } from './core/guards/not-waiter-guard';
import { ReservationsComponent } from './pages/reservations/reservations';


export const routes: Routes = [
  // Если адрес пустой (http://localhost:4200), показываем Главную
  { path: '', component: Home }, 
  { path: 'restaurants', component: RestaurantsComponent, canActivate: [notWaiterGuard] },
  { path: 'restaurant/:id', component: RestaurantDetailComponent, canActivate: [notWaiterGuard] },
  
  // Если адрес http://localhost:4200/about, показываем страницу About
  { path: 'about', component: About },

  { path: 'admin', component: Admin, canActivate: [adminGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [waiterGuard] },
  { path: 'reservations', component: ReservationsComponent, canActivate: [waiterGuard] },
  
  // Редирект на главную, если пользователь ввел несуществующий адрес
  { path: '**', redirectTo: '' } 
];
