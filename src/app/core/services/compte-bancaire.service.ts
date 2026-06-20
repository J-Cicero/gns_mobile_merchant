import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompteBancaireService {
  private apiUrl = `${environment.apiUrl}/api/comptes-bancaires`;

  constructor(private http: HttpClient) {}

  createAccount(ownerTrackingId: any, ownerType: any, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/owner/${ownerTrackingId}/type/${ownerType}`, data);
  }

  uploadRib(compteTrackingId: any, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${compteTrackingId}/rib`, data);
  }

  uploadMandat(compteTrackingId: any, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${compteTrackingId}/mandat`, data);
  }

  findByOwnerTrackingId(ownerTrackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner/${ownerTrackingId}`);
  }

  delete(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }
}
