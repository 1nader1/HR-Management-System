import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EmployeeService } from '../services/employee'; 
import { NotificationService } from '../services/notification';
import { ReportService } from '../services/report'; 
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgApexchartsModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  
  isLoaded = false;
  showReportModal = false;

  stats = {
    totalEmployees: 0,
    departmentsCount: 0,
    totalProfits: '0 JD',
    siteVisits: 0
  };

  employees: any[] = [];
  reportType: string = 'salary'; 
  salaryCondition: string = 'greater'; 
  salaryAmount: number = 500;
  selectedDept: string = '';
  departments: string[] = [];

  public barChartOptions: any;
  public pieChartOptions: any;

  constructor(
    private employeeService: EmployeeService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef,
    private notify: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadSiteVisits();
    this.fetchRealData();
  }

  toggleReportModal() {
    this.showReportModal = !this.showReportModal;
  }

  generateReport() {

    const isSuccess = this.reportService.generateEmployeeReport(
      this.employees, 
      this.reportType, 
      this.salaryCondition, 
      this.salaryAmount, 
      this.selectedDept
    );

    if (!isSuccess) {
      alert('لا يوجد موظفين يطابقون شروط التقرير.');
      return;
    }

    this.toggleReportModal(); 
  }

  fetchRealData() {
    this.employeeService.getEmployees().subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          this.employees = data;
          
          const totalEmp = data.length;
          const depts = Array.from(new Set(data.map(e => e.department || e.Department).filter(d => d))) as string[];
          this.departments = depts;
          
          const totalSal = data.reduce((sum, e) => sum + (e.salary || e.Salary || 0), 0);

          this.stats = {
            ...this.stats,
            totalEmployees: totalEmp,
            departmentsCount: depts.length,
            totalProfits: totalSal.toLocaleString() + ' JD'
          };

          if (totalSal >= 50000) {
            const msg = `${this.translate.instant('NOTIFICATIONS.FINANCIAL_ALERT_MSG')} (${totalSal.toLocaleString()} JD)`;
            this.notify.showFinancialAlert(msg);
          }

          this.initCharts(data, depts);
          this.isLoaded = true;
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error("Error:", err)
    });
  }

  initCharts(data: any[], uniqueDepts: any[]) {
    const deptCounts = uniqueDepts.map(d => data.filter(e => (e.department || e.Department) === d).length);

    this.pieChartOptions = {
      series: deptCounts,
      chart: { type: "donut", height: 350, fontFamily: 'inherit' },
      labels: uniqueDepts,
      colors: ['#4a90e2', '#50e3c2', '#f5a623', '#d0021b', '#bd10e0']
    };

    this.barChartOptions = {
      series: [{ name: "رواتب الأقسام", data: uniqueDepts.map(d => data.filter(e => (e.department || e.Department) === d).reduce((s, e) => s + (e.salary || e.Salary || 0), 0)) }],
      chart: { type: "bar", height: 350, toolbar: { show: false } },
      xaxis: { categories: uniqueDepts },
      colors: ['#4a90e2']
    };
  }

  loadSiteVisits() {
    const visits = localStorage.getItem('site_visits');
    const currentVisits = visits ? parseInt(visits, 10) : 0;
    this.stats.siteVisits = currentVisits;

    if (currentVisits > 0 && currentVisits % 50 === 0) {
        const notified = localStorage.getItem('notified_visits');
        if (notified !== currentVisits.toString()) {
        const msg = `${this.translate.instant('NOTIFICATIONS.MILESTONE_MSG')} ${currentVisits}`;
        this.notify.showMilestone(msg);
        localStorage.setItem('notified_visits', currentVisits.toString());
      }
    }
  }
}