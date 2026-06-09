import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Employee } from './employee/employee'; 
import { authGuard } from './services/auth-guard';
import { DashboardComponent } from './dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'employees', component: Employee, canActivate: [authGuard] }, 
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent }
]