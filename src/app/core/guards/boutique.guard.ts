import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MerchantService } from '../services/merchant.service';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueGuard implements CanActivate {

  constructor(
    private merchantService: MerchantService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
    
    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const selectedBoutique = this.merchantService.getSelectedBoutiqueId();
    if (selectedBoutique) {
      return true;
    }

    return this.merchantService.hasBoutique(merchantId).pipe(
      map(has => {
        if (!has) {
          this.showToast('Votre boutique doit être configurée pour accéder à cette section.');
          this.router.navigate(['/create-boutique']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/create-boutique']);
        return of(false);
      })
    );
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'warning',
      position: 'top',
      icon: 'alert-circle-outline'
    });
    toast.present();
  }
}
