import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Employee } from './employee/employee'; 
import { authGuard } from './services/auth-guard';
import { DashboardComponent } from './dashboard/dashboard';
import { ResumeAnalyzerComponent } from './resume-analyzer/resume-analyzer';
import { CandidatesBoardComponent } from './candidates-board/candidates-board';
import { UserManagementComponent } from './user-management/user-management';
import { AuthService } from './services/auth';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'employees', component: Employee, canActivate: [authGuard] }, 
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'resume-analyzer', component: ResumeAnalyzerComponent },
  { path: 'candidates-board', component: CandidatesBoardComponent },
  {path: 'user-management', component: UserManagementComponent,canActivate: [authGuard]}

]