import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule , Router} from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { TranslateService, TranslateModule } from '@ngx-translate/core'; 
import { AuthService } from './services/auth';
import { NotificationService, AppNotification } from './services/notification';

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
  unreadCount = 0;
  notifications: AppNotification[] = []; 

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
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {
      this.userLoggedIn = status;
    });

    this.notifyService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = this.notifyService.getUnreadCount();
      
      this.cdr.detectChanges(); 
    });
  }

  showNavBar(): boolean {
    const currentUrl = this.router.url;
    return !(currentUrl === '/' || currentUrl === '/login');
  }

  isLoggedIn(): boolean {
    return this.userLoggedIn;
  }

  logout() {
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
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.isNotificationOpen = false;
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.notifyService.markAllAsRead();
  }
}