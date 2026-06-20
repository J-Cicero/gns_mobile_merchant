import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentRequisService {
  private apiUrl = `${environment.apiUrl}/document-requis`;

  constructor(private http: HttpClient) {}

  getDocumentRequisByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  getDocumentRequisByType(typeDocument: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/type/${typeDocument}`);
  }

  deleteDocumentRequis(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }
}
