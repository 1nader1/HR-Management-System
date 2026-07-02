import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { TranslateService, TranslateModule } from '@ngx-translate/core'; 
import { AuthService } from './services/auth';
import { NotificationService, AppNotification } from './services/notification';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, TranslateModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  currentLang = 'ar';
  userLoggedIn = false;
  isNotificationOpen = false;
  isProfileMenuOpen = false;
  unreadCount = 0;
  notifications: AppNotification[] = []; 
  isLoginPage = false;


userName = '';
userEmail = '';
userRole = ''; 
userAvatar = '';

  constructor(
    private router: Router, 
    private translate: TranslateService,
    private authService: AuthService,
    private notifyService: NotificationService,
    private cdr: ChangeDetectorRef 
  ) {
    this.translate.setDefaultLang('ar');
    this.translate.use('ar');
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    this.checkRoute(this.router.url);
  }

  get isManager(): boolean {
  const role = this.authService.getRole();
  return role === 'Manager' || role === 'Owner'; 
}


  get userInitial(): string {
    return this.userName ? this.userName.charAt(0).toUpperCase() : 'U';
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {
      this.userLoggedIn = status;
      if (status) {
        this.loadUserData(); 
      }
    });

    this.notifyService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = this.notifyService.getUnreadCount();
      this.cdr.detectChanges(); 
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });


    if (this.authService.isLoggedIn$) {
      this.loadUserData();
    }
  }


  private loadUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      try {

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        console.log('محتوى التوكن من السيرفر:', payload);

        this.userName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
        || payload.name 
        || payload.unique_name 
        || 'User';

        this.userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
        || payload.role 
        || payload.Role 
        || 'User';

        this.userEmail = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] 
        || payload.email 
        || payload.Email 
        || 'الإيميل غير مسجل بالتوكن!';

      } catch (e) {
        console.error('Error decoding token', e);
      }
    }
  }

  private checkRoute(url: string) {
    this.isLoginPage = url.includes('login') || url.includes('register') || url.includes('signup') || url === '/' || url === '';
  }

  showNavBar(): boolean {
    return !this.isLoginPage;
  }

  isLoggedIn(): boolean {
    return this.userLoggedIn;
  }

  logout() {
    this.isProfileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translate.use(this.currentLang);
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLang;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;
    if (this.isNotificationOpen) this.isProfileMenuOpen = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    if (this.isProfileMenuOpen) this.isNotificationOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.isNotificationOpen = false;
    this.isProfileMenuOpen = false;
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.notifyService.markAllAsRead();
  }
}