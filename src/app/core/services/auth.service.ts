import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Assuming these models exist or will be created in merchant.model.ts or a shared auth.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  trackingId: string;
  rolesList: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`; // Login endpoint is /users/login
  private currentUserSubject: BehaviorSubject<LoginResponse | null>;
  public currentUser: Observable<LoginResponse | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(
      JSON.parse(localStorage.getItem('currentMerchantUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((res: LoginResponse) => {
        if (res && res.token && res.trackingId) {
          localStorage.setItem('currentMerchantUser', JSON.stringify(res));
          this.currentUserSubject.next(res);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('currentMerchantUser');
    localStorage.removeItem('selectedBoutiqueId'); // Clear selected boutique on logout
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.rolesList) return false;
    return user.rolesList.includes(role) || user.rolesList.includes(`ROLE_${role}`);
  }

  public getCurrentMerchantId(): string | null {
    return this.currentUserSubject.value?.trackingId || null;
  }
}
