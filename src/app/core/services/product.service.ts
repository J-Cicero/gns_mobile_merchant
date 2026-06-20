import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

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

  getBoutiqueBoutiquetrackingid(boutiqueTrackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/boutique/${boutiqueTrackingId}`);
  }

  getDisponibleEstdisponible(estDisponible: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/disponible/${estDisponible}`);
  }
}
