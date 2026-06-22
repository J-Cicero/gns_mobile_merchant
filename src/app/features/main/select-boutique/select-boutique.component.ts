import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { MerchantService } from '../../../core/services/merchant.service';
import { AuthService } from '../../../core/services/auth.service';
import { Boutique } from '../../../core/models/boutique.model';
import { addIcons } from 'ionicons';
import { storefrontOutline, logOutOutline, chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-select-boutique',
  templateUrl: './select-boutique.component.html',
  styleUrls: ['./select-boutique.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SelectBoutiqueComponent implements OnInit {
  boutiques: Boutique[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private merchantService: MerchantService,
    private authService: AuthService
  ) {
    addIcons({ storefrontOutline, logOutOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.loadBoutiques();
  }

  loadBoutiques() {
    this.isLoading = true;
    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.merchantService.getBoutiquesByMerchant(merchantId).subscribe({
      next: (boutiques) => {
        this.isLoading = false;
        if (boutiques && boutiques.length > 0) {
          this.boutiques = boutiques;
          // If only 1 boutique, auto-select and go to dashboard
          if (this.boutiques.length === 1) {
            this.selectBoutique(this.boutiques[0]);
          }
        } else {
          // 0 boutique -> go to create
          this.router.navigate(['/main/create-boutique']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des boutiques.';
      }
    });
  }

  selectBoutique(boutique: Boutique) {
    this.merchantService.setSelectedBoutiqueId(boutique.trackingId);
    this.router.navigate(['/main/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
