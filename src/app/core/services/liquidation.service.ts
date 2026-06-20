import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LiquidationService {
  private apiUrl = `${environment.apiUrl}/liquidations`;

  constructor(private http: HttpClient) {}

  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  findByBoutiqueId(boutiqueId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/boutique/${boutiqueId}`);
  }

  getPendingTotal(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/pending-total`);
  }

  validerLiquidation(trackingId: any, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${trackingId}/valider`, data);
  }
}
