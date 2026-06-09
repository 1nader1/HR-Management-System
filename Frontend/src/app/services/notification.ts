import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http'; 

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  time: Date;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private formspreeUrl = 'https://formspree.io/f/xdavnare';

  private notifications: AppNotification[] = [];
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private toastr: ToastrService, 
    private translate: TranslateService,
    private http: HttpClient 
  ) {}

  private getPosition(): string {
    return this.translate.currentLang === 'ar' ? 'toast-top-right' : 'toast-top-left';
  }

  private sendEmailToManager(subject: string, message: string) {
    const emailData = {
      subject: subject,
      message: message,
      system: 'HR System Alerts'
    };

    this.http.post(this.formspreeUrl, emailData).subscribe({
      next: () => console.log('تم إرسال الإيميل للمدير بنجاح!'),
      error: (err) => console.error('فشل إرسال الإيميل:', err)
    });
  }

  private addNotificationToList(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') {
    const newNotif: AppNotification = {
      id: Date.now(),
      title: title,
      message: message,
      isRead: false,
      time: new Date(),
      type: type
    };

    this.notifications.unshift(newNotif);
    this.notificationsSubject.next(this.notifications);

    let icon = '🔔';
    if (type === 'error') icon = '🚨';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';

    // استدعاء الإيميل 
    this.sendEmailToManager(`${icon} نظام الموارد البشرية: ${title}`, message);
  }

  showSuccess(message: string, title: string = 'عملية ناجحة') {
    this.toastr.success(message, title, { positionClass: this.getPosition() });
    this.addNotificationToList(title, message, 'success');
  }

  showError(message: string, title: string = 'خطأ') {
    this.toastr.error(message, title, { positionClass: this.getPosition() });
    this.addNotificationToList(title, message, 'error');
  }

  showFinancialAlert(message: string) {
    this.toastr.warning(message, 'تنبيه مالي', { positionClass: this.getPosition(), timeOut: 5000 });
    this.addNotificationToList('تنبيه مالي', message, 'warning');
  }

  showMilestone(message: string) {
    this.toastr.info(message, 'إنجاز جديد!', { positionClass: this.getPosition() });
    this.addNotificationToList('إنجاز جديد!', message, 'info');
  }

  showSystemNotice(message: string) {
    this.toastr.show(message, 'إشعار نظام', { positionClass: this.getPosition() });
    this.addNotificationToList('إشعار نظام', message, 'info');
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.notificationsSubject.next(this.notifications);
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }
}