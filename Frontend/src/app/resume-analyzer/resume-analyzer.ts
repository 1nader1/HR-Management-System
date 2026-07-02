import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../services/candidate';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-resume-analyzer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './resume-analyzer.html',
  styleUrls: ['./resume-analyzer.css']
})
export class ResumeAnalyzerComponent {
  isAnalyzing = false;
  candidateResult: any = null;
  errorMessage = '';

  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.handleFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    this.handleFile(file);
  }

  handleFile(file: File | undefined) {
    if (file && file.type === 'application/pdf') {
      this.errorMessage = '';
      this.startAnalysis(file);
    } else {
      this.errorMessage = 'AI_ANALYZER.ERROR_PDF';
      this.cdr.detectChanges();
    }
  }

  startAnalysis(file: File) {
    this.isAnalyzing = true;
    this.candidateResult = null;
    this.cdr.detectChanges();

    this.candidateService.uploadAndAnalyze(file).subscribe({
      next: (res) => {
        this.candidateResult = res;
        this.isAnalyzing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'AI_ANALYZER.ERROR_GENERAL';
        this.isAnalyzing = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetAnalyzer() {
    this.isAnalyzing = false;
    this.candidateResult = null;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }
}