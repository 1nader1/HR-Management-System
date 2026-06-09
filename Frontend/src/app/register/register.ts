import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [TranslateModule,FormsModule, RouterLink],
  templateUrl: './register.html', 
  styleUrl: './register.css' 
})
export class Register {

  registerObj = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  onRegister() {

    if (this.registerObj.name && this.registerObj.email && this.registerObj.password) {
      
      this.authService.register(this.registerObj).subscribe({
        

        next: (res: any) => {
          alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
          this.router.navigate(['/login']); 
        },
        

        error: (err) => {

          console.error('تفاصيل الخطأ الكاملة:', err); 
                    const errorMessage = (err.error && err.error.message) 
                                ? err.error.message 
                                : 'حدث خطأ في الاتصال بالسيرفر! يرجى التأكد من تشغيل الباك إند.';
          alert(errorMessage);
        }
        
      });

    } else {
      alert('الرجاء تعبئة جميع الحقول بشكل صحيح');
    }
  }
}