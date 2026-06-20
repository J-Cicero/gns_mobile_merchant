import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BanqueService {
  private apiUrl = `${environment.apiUrl}/banques`;

  constructor(private http: HttpClient) {}

  uploadRibDocument(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload-rib`, data);
  }
}
