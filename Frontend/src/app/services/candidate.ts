import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  
private apiUrl = `${environment.apiUrl}/Resume`;

  constructor(private http: HttpClient) { }

  uploadAndAnalyze(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getAllCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}