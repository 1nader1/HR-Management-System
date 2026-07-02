import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../services/notification';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  isLoading = true;
  errorMessage = '';
  selectedUserIds: number[] = [];
  
  currentUserRole = '';
  currentUserEmail = '';
  availableRoles: string[] = [];

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private notify: NotificationService,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.getRole();
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        
        this.currentUserEmail = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] 
                             || payload.email 
                             || payload.Email 
                             || '';
      } catch (e) {}
    }

      this.availableRoles = ['User', 'Manager'];    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        this.selectedUserIds = []; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.translate.instant('USER_MANAGEMENT.FETCH_ERROR');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  canModifyUser(user: any): boolean {
    return user.role !== 'Owner';
  }

  canChangeRole(user: any): boolean {
    if (user.role === 'Owner') return false;
    if (this.currentUserRole === 'Manager' && user.email === this.currentUserEmail) return false;
    return true;
  }

  onRoleChange(userId: number, event: any): void {
    const newRole = event.target.value;
    this.userService.changeRole(userId, newRole).subscribe({
      next: (res) => {
        this.notify.showSuccess(res.message, this.translate.instant('USER_MANAGEMENT.SUCCESS'));
        this.loadUsers();
      },
      error: (err) => {
        this.notify.showError(err.error?.message, this.translate.instant('USER_MANAGEMENT.ERROR'));
        this.loadUsers();
      }
    });
  }

  toggleUserStatus(userId: number): void {
    this.userService.toggleStatus(userId).subscribe({
      next: (res) => {
        this.notify.showSuccess(res.message, this.translate.instant('USER_MANAGEMENT.SUCCESS'));
        this.loadUsers();
      },
      error: (err) => {
        this.notify.showError(err.error?.message, this.translate.instant('USER_MANAGEMENT.ERROR'));
        this.loadUsers();
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm(this.translate.instant('USER_MANAGEMENT.DELETE_CONFIRM'))) {
      this.userService.deleteUser(userId).subscribe({
        next: (res) => {
          this.notify.showSuccess(res.message, this.translate.instant('USER_MANAGEMENT.SUCCESS'));
          this.loadUsers();
        },
        error: (err) => {
          this.notify.showError(err.error?.message, this.translate.instant('USER_MANAGEMENT.ERROR'));
        }
      });
    }
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.selectedUserIds = this.users.filter(u => u.role !== 'Owner').map(u => u.id);
    } else {
      this.selectedUserIds = [];
    }
  }

  toggleSelectUser(userId: number, event: any): void {
    if (event.target.checked) {
      this.selectedUserIds.push(userId);
    } else {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds.includes(userId);
  }

  isAllSelected(): boolean {
    const selectableUsers = this.users.filter(u => u.role !== 'Owner');
    return selectableUsers.length > 0 && this.selectedUserIds.length === selectableUsers.length;
  }

  executeBulkAction(action: string): void {
    let confirmMsg = this.translate.instant('USER_MANAGEMENT.BULK_CONFIRM');
    if (action === 'delete') {
        confirmMsg = this.translate.instant('USER_MANAGEMENT.BULK_DELETE_CONFIRM');
    }

    if (confirm(confirmMsg)) {
      this.userService.bulkAction(this.selectedUserIds, action).subscribe({
        next: (res) => {
          this.notify.showSuccess(res.message, this.translate.instant('USER_MANAGEMENT.SUCCESS'));
          this.loadUsers();
        },
        error: (err) => {
          this.notify.showError(err.error?.message, this.translate.instant('USER_MANAGEMENT.ERROR'));
          this.loadUsers();
        }
      });
    }
  }
}