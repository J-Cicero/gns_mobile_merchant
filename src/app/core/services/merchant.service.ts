import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MerchantResponse, MerchantRequest } from '../models/merchant.model';
import { Boutique, Produit } from '../models/boutique.model';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { LiquidationRequest, LiquidationResponse } from '../models/liquidation.model';
import { ProductRequest, ProductResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {
  private apiUrl = environment.apiUrl;
  
  private selectedBoutiqueSource = new BehaviorSubject<string | null>(localStorage.getItem('selectedBoutiqueId'));
  selectedBoutiqueId$ = this.selectedBoutiqueSource.asObservable();

  constructor(private http: HttpClient) {}

  setSelectedBoutiqueId(boutiqueId: string) {
    localStorage.setItem('selectedBoutiqueId', boutiqueId);
    this.selectedBoutiqueSource.next(boutiqueId);
  }

  getSelectedBoutiqueId(): string | null {
    return this.selectedBoutiqueSource.getValue();
  }

  registerMerchant(request: MerchantRequest, ribFile?: File): Observable<MerchantResponse> {
    const formData = new FormData();
    formData.append('merchant', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    
    if (ribFile) {
      formData.append('rib', ribFile);
    }
    return this.http.post<MerchantResponse>(`${this.apiUrl}/merchants`, formData);
  }

  getMerchantProfile(trackingId: string): Observable<MerchantResponse> {
    return this.http.get<MerchantResponse>(`${this.apiUrl}/merchants/${trackingId}`);
  }

  getBanks(): Observable<any[]> { // Keeping as any[] for now, no specific model for Bank yet
    return this.http.get<any[]>(`${this.apiUrl}/banques`);
  }

  // Placeholder for document upload
  uploadDocument(merchantTrackingId: string, typeDocument: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('merchantTrackingId', merchantTrackingId);
    formData.append('typeDocument', typeDocument);
    // This endpoint needs to be implemented in backend if it doesn't exist.
    return this.http.post<any>(`${this.apiUrl}/merchants/documents/upload`, formData);
  }

  requestLiquidation(request: LiquidationRequest): Observable<LiquidationResponse> {
    return this.http.post<LiquidationResponse>(`${this.apiUrl}/liquidations`, request);
  }

  createBoutique(request: Boutique): Observable<Boutique> {
    return this.http.post<Boutique>(`${this.apiUrl}/boutiques`, request);
  }

  hasBoutique(merchantId: string): Observable<boolean> {
    return this.getBoutiquesByMerchant(merchantId).pipe(
      map(boutiques => boutiques && boutiques.length > 0)
    );
  }


  getBoutiquesByMerchant(merchantId: string): Observable<Boutique[]> {
    return this.http.get<any>(`${this.apiUrl}/boutiques/merchant/${merchantId}`).pipe(
      map(res => {
        // The backend returns a Page structure (res.content)
        if (res && res.content) {
          return res.content;
        }
        return res; // Fallback if it's already an array
      }),
      catchError(err => {
        if (err.status === 404) {
          return of([]);
        }
        throw err;
      })
    );
  }

  getBoutiqueById(trackingId: string): Observable<Boutique> {
    return this.http.get<Boutique>(`${this.apiUrl}/boutiques/${trackingId}`);
  }

  updateBoutique(trackingId: string, request: Boutique): Observable<Boutique> {
    return this.http.put<Boutique>(`${this.apiUrl}/boutiques/${trackingId}`, request);
  }

  addProduct(request: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.apiUrl}/products`, request);
  }

  getProducts(boutiqueId: string): Observable<Produit[]> {
    return this.http.get<any>(`${this.apiUrl}/products/boutique/${boutiqueId}`).pipe(
      map(res => {
        if (res && res.content) {
          return res.content;
        }
        return res || [];
      }),
      catchError(err => {
        if (err.status === 404) {
          return of([]);
        }
        throw err;
      })
    );
  }


  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  updateTrackingid(trackingId: any, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${trackingId}`, data);
  }

  delete(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }
}
