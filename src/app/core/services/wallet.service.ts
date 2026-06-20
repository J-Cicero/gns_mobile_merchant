import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = `${environment.apiUrl}/wallets`;

  constructor(private http: HttpClient) {}

  updateTrackingid(trackingId: any, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${trackingId}`, data);
  }

  deleteTrackingid(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }

  getTrackingid(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  getTypeTypewallet(typeWallet: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/type/${typeWallet}`);
  }

  findFiltered(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/filter`);
  }

  gelerTousLesWallets(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/freeze-all`, data);
  }
}
