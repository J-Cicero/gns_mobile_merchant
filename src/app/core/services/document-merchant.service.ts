import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentMerchantService {
  private apiUrl = `${environment.apiUrl}/merchants/documents`;

  constructor(private http: HttpClient) {}

  uploadDocument(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload`, data);
  }

  findByMerchantId(merchantId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/merchant/${merchantId}`);
  }
}
