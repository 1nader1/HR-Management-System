import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

    //filter data based on report type and criteria, then trigger CSV download
  generateEmployeeReport(employees: any[], reportType: string, condition: string, amount: number, dept: string): boolean {
    let filteredData = [];

    if (reportType === 'salary') {
      filteredData = employees.filter(emp => {
        const empSalary = emp.salary || emp.Salary || 0;
        return condition === 'greater' 
          ? empSalary >= amount 
          : empSalary <= amount;
      });
    } else if (reportType === 'department') {
      filteredData = employees.filter(emp => (emp.department || emp.Department) === dept);
    }

    if (filteredData.length === 0) {
      return false;
    }

    this.downloadCSV(filteredData, reportType);
    return true;
  }

  //generate CSV string from filtered data and trigger download
  private downloadCSV(data: any[], reportType: string) {
    const headers = ['Name', 'Email', 'Department', 'Position', 'Salary'];
    const csvRows = [headers.join(',')];

    data.forEach(emp => {
      const row = [
        emp.name || emp.Name, 
        emp.email || emp.Email, 
        emp.department || emp.Department, 
        emp.position || emp.Position, 
        emp.salary || emp.Salary
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toLocaleDateString();
    link.download = `HR_Report_${reportType}_${date}.csv`;
    link.click();
    
    window.URL.revokeObjectURL(url); 
  }
}