import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EmployeeService } from '../services/employee';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // هنا نقوم باستيراد كل ما يحتاجه الكومبوننت ليعمل في بيئة الاختبار
      imports: [
        DashboardComponent, 
        TranslateModule.forRoot(), 
        NgApexchartsModule,
        HttpClientTestingModule
      ],
      providers: [EmployeeService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});