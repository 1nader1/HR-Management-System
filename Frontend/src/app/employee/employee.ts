import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { EmployeeService } from '../services/employee';
import { Employee as EmployeeModel } from '../models/employee.model'; 
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../services/notification'; 
import { TranslateService } from '@ngx-translate/core';
import{AuthService} from '../services/auth';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [TranslateModule, CommonModule, FormsModule],
  templateUrl: './employee.html', 
  styleUrls: ['./employee.css'],
})
export class Employee implements OnInit { 
  
  userRole: string = 'User';
  employees: EmployeeModel[] = [];
  currentEmployee: EmployeeModel = { id: 0, name: '', email: '', position: '', salary: 0, department: '' };
  
  isEditing: boolean = false; 
  showForm: boolean = false;
  emailError = false;
  itemsPerPage: number = 6;

  departments = ['IT', 'HR', 'Marketing', 'Sales', 'Finance'];
  
  jobMap: { [key: string]: string[] } = {
    'IT': ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'System Admin', 'IT Support'],
    'HR': ['HR Manager', 'Recruiter', 'Payroll Specialist', 'Training Coordinator'],
    'Marketing': ['Content Creator', 'Social Media Manager', 'SEO Specialist', 'Graphic Designer'],
    'Sales': ['Sales Manager', 'Account Executive', 'Sales Representative'],
    'Finance': ['Accountant', 'Financial Analyst', 'Auditor', 'Finance Manager']
  };

  filteredPositions: string[] = [];

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private notify: NotificationService,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit() { 
    this.loadEmployees(); 
    this.userRole = this.authService.getRole();
  }

  onDepartmentChange() {
    this.filteredPositions = this.jobMap[this.currentEmployee.department] || [];
    if (!this.filteredPositions.includes(this.currentEmployee.position)) {
      this.currentEmployee.position = '';
    }
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.notify.showError(this.translate.instant('NOTIFICATIONS.EMP_FETCH_ERR'), this.translate.instant('NOTIFICATIONS.ERROR_TITLE'));
      }
    });
  }

  openAddForm() {
    this.currentEmployee = { id: 0, name: '', email: '', position: '', salary: 0, department: '' };
    this.filteredPositions = [];
    this.isEditing = false;
    this.showForm = true; 
  }

  onSubmit(form: any) {
    if (form.invalid) return; 

    this.emailError = false;
    const isDuplicate = this.employees.some(emp => 
      emp.email.toLowerCase() === this.currentEmployee.email.toLowerCase() && 
      emp.id !== this.currentEmployee.id
    );

    if (isDuplicate) {
      this.emailError = true;
      this.notify.showError(this.translate.instant('NOTIFICATIONS.EMP_EMAIL_ERR'), this.translate.instant('NOTIFICATIONS.ERROR_TITLE'));
      return; 
    }

    if (this.isEditing) {
      this.employeeService.updateEmployee(this.currentEmployee).subscribe(() => {
      this.notify.showSuccess(this.translate.instant('NOTIFICATIONS.EMP_UPD_SUCCESS'), this.translate.instant('NOTIFICATIONS.SUCCESS_TITLE'));        this.loadEmployees(); 
        this.resetForm();     
      });
    } else {
      this.employeeService.addEmployee(this.currentEmployee).subscribe(() => {
        this.notify.showSuccess(this.translate.instant('NOTIFICATIONS.EMP_ADD_SUCCESS'), this.translate.instant('NOTIFICATIONS.SUCCESS_TITLE'));
        this.loadEmployees();
        this.resetForm();
      });
    }
  }

  editEmployee(emp: EmployeeModel) {
    this.currentEmployee = { ...emp }; 
    this.isEditing = true;
    this.onDepartmentChange(); 
    this.showForm = true;
  }

  deleteEmployee(id: number) {
    if(confirm('هل أنت متأكد أنك تريد حذف هذا الموظف؟')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {

          this.notify.showSuccess(this.translate.instant('NOTIFICATIONS.EMP_DEL_SUCCESS'), this.translate.instant('NOTIFICATIONS.SUCCESS_TITLE'));
          this.loadEmployees();
        },
        error: (err) => {
          console.error('Error deleting:', err);
          this.notify.showError('حدث خطأ أثناء الحذف');
        }
      });
    }
  }

  resetForm() {
    this.currentEmployee = { id: 0, name: '', email: '', position: '', salary: 0, department: '' };
    this.filteredPositions = [];
    this.isEditing = false;
    this.showForm = false;
  }
}