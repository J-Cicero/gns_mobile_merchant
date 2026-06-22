import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { MerchantService } from '../../../core/services/merchant.service';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { storefrontOutline, addCircleOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-create-boutique',
  templateUrl: './create-boutique.component.html',
  styleUrls: ['./create-boutique.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CreateBoutiqueComponent implements OnInit {
  newBoutique = {
    name: '',
    description: ''
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private merchantService: MerchantService,
    private authService: AuthService
  ) {
    addIcons({ storefrontOutline, addCircleOutline, logOutOutline });
  }

  ngOnInit() {
    // Check if user already has a boutique, if yes, navigate to dashboard
    const merchantId = this.authService.getCurrentMerchantId();
    if (merchantId) {
      this.merchantService.getBoutiquesByMerchant(merchantId).subscribe({
        next: (boutiques) => {
          if (boutiques && boutiques.length > 0) {
            this.router.navigate(['/main/dashboard']);
          }
        }
      });
    }
  }

  submitBoutique() {
    if (!this.newBoutique.name || !this.newBoutique.description) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) {
      this.errorMessage = 'Erreur d\'authentification.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: any = {
      name: this.newBoutique.name,
      description: this.newBoutique.description,
      kycStatus: 'EN_ATTENTE',
      merchantTrackingId: merchantId
    };

    this.merchantService.createBoutique(request).subscribe({
      next: (boutique) => {
        this.isLoading = false;
        this.merchantService.setSelectedBoutiqueId(boutique.trackingId);
        this.router.navigate(['/main/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création de la boutique.';
        console.error('Boutique creation error', err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
