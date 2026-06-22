import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { MerchantService } from '../../../core/services/merchant.service';
import { MerchantResponse } from '../../../core/models/merchant.model';
import { Boutique } from '../../../core/models/boutique.model';
import { addIcons } from 'ionicons';
import { addOutline, storefrontOutline, locationOutline, closeOutline } from 'ionicons/icons';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule] // Add FormsModule
})
export class ProfileComponent implements OnInit, ViewWillEnter {

  merchantProfile: MerchantResponse | null = null;
  boutiques: Boutique[] = [];
  selectedBoutiqueId: string | null = null;
  isDarkMode = false;
  isLoading = false;
  errorMessage = '';
  isAddBoutiqueModalOpen = false;
  newBoutique: Partial<Boutique> = {
    name: '',
    description: ''
  };
  isSubmittingBoutique = false;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private merchantService: MerchantService
  ) {
    addIcons({ addOutline, storefrontOutline, locationOutline, closeOutline });
  }

  ngOnInit() {
    this.isDarkMode = this.themeService.isDark;
  }

  ionViewWillEnter() {
    this.loadProfileData();
  }

  loadProfileData() {
    this.isLoading = true;
    this.errorMessage = '';
    const merchantId = this.authService.getCurrentMerchantId();

    if (!merchantId) {
      this.errorMessage = 'ID marchand introuvable. Veuillez vous reconnecter.';
      this.isLoading = false;
      this.router.navigate(['/auth/login']);
      return;
    }

    this.merchantService.getMerchantProfile(merchantId).subscribe({
      next: (profile) => {
        this.merchantProfile = profile;
        this.loadBoutiques(merchantId);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement du profil marchand: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  loadBoutiques(merchantId: string) {
    this.merchantService.getBoutiquesByMerchant(merchantId).subscribe({
      next: (boutiques) => {
        this.boutiques = boutiques;
        if (this.boutiques.length > 0) {
          this.selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId() || this.boutiques[0].trackingId;
          this.merchantService.setSelectedBoutiqueId(this.selectedBoutiqueId);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des boutiques: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  onBoutiqueChange(event: any) {
    const selectedId = event.detail.value;
    this.merchantService.setSelectedBoutiqueId(selectedId);
    // Optionally, refresh other parts of the profile that depend on the selected boutique
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  openAddBoutiqueModal() {
    this.newBoutique = { name: '', description: '' };
    this.errorMessage = '';
    this.isAddBoutiqueModalOpen = true;
  }

  closeAddBoutiqueModal() {
    this.isAddBoutiqueModalOpen = false;
  }

  submitNewBoutique() {
    if (!this.newBoutique.name || !this.newBoutique.description) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) return;

    this.isSubmittingBoutique = true;
    this.errorMessage = '';

    const request: any = {
      name: this.newBoutique.name,
      description: this.newBoutique.description,
      kycStatus: 'EN_ATTENTE',
      merchantTrackingId: merchantId
    };

    this.merchantService.createBoutique(request).subscribe({
      next: (boutique) => {
        this.isSubmittingBoutique = false;
        this.closeAddBoutiqueModal();
        this.loadBoutiques(merchantId); // Refresh list
      },
      error: (err) => {
        this.isSubmittingBoutique = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création de la boutique.';
      }
    });
  }
}
