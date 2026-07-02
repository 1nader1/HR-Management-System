import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router'; 
import { AuthService } from '../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslateModule, FormsModule, RouterLink], 
  templateUrl: './login.html', 
  styleUrl: './login.css' 
})
export class Login { 

  loginObj = {
    email: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    if (this.loginObj.email && this.loginObj.password) {
      localStorage.removeItem('token');
      
      this.authService.login(this.loginObj).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          let currentVisits = localStorage.getItem('site_visits');
          let newVisitsCount = currentVisits ? parseInt(currentVisits, 10) + 1 : 1;
          localStorage.setItem('site_visits', newVisitsCount.toString());
          this.router.navigate(['/employees']); 
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة!';
          alert(errorMessage);
        }
      });
    } else {
      alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
    }
  }
}