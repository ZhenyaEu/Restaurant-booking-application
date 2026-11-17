import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Admin } from './pages/admin/admin';
import { adminGuard } from './core/guards/admin-guard';
import { OrdersComponent } from './pages/orders/orders';
import { waiterGuard } from './core/guards/waiter-guard';


export const routes: Routes = [
  // Если адрес пустой (http://localhost:4200), показываем Главную
  { path: '', component: Home }, 
  
  // Если адрес http://localhost:4200/about, показываем страницу About
  { path: 'about', component: About },

  { path: 'admin', component: Admin, canActivate: [adminGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [waiterGuard] },
  
  // Редирект на главную, если пользователь ввел несуществующий адрес
  { path: '**', redirectTo: '' } 
];
