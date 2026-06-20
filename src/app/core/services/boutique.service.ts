import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) {}

  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  updateTrackingid(trackingId: any, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${trackingId}`, data);
  }

  delete(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }

  getMerchantMerchanttrackingid(merchantTrackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/merchant/${merchantTrackingId}`);
  }

  getWalletWallettrackingid(walletTrackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/wallet/${walletTrackingId}`);
  }

  getKycStatutkyc(statutKYC: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/kyc/${statutKYC}`);
  }

  getLowQuotaCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/low-quota-count`);
  }

  getBoutiquesEnAlerte(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alertes-quota`);
  }
}
