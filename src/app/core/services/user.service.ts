import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  createUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  getGetTrackingid(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${trackingId}`);
  }

  patchEtatTrackingid(trackingId: any, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/etat/${trackingId}`, data);
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`);
  }

  deleteUser(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${trackingId}`);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  getSearch(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search`);
  }
}
