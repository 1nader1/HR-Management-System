import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
private apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  changeRole(id: number, newRole: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-role/${id}`, { newRole });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/toggle-status/${id}`, {});
  }

  bulkAction(userIds: number[], action: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-action`, { userIds, action });
  }
}