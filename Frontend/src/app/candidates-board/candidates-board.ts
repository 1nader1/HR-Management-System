import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../services/candidate';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-candidates-board',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './candidates-board.html',
  styleUrls: ['./candidates-board.css']
})
export class CandidatesBoardComponent implements OnInit {
  candidates: any[] = [];
  isLoading = true;
  errorMessage = '';
  
  isModalOpen = false;
  selectedCandidate: any = null;
  
  userRole: string = 'User'; 

  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {

    this.userRole = this.authService.getRole();
        console.log('Role fetched in Candidates Board:', this.userRole);
    
    this.loadCandidates();
  }


  loadCandidates() {
    this.candidateService.getAllCandidates().subscribe({
      next: (data) => {
        this.candidates = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'CANDIDATES_BOARD.ERROR_LOAD';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openRecommendation(candidate: any) {
    this.selectedCandidate = candidate;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCandidate = null;
  }

  deleteCandidate(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المرشح نهائياً؟')) {
      this.candidateService.deleteCandidate(id).subscribe({
        next: () => {
          this.candidates = this.candidates.filter(c => c.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert('حدث خطأ أثناء محاولة الحذف.');
        }
      });
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-med';
    return 'score-low';
  }
}