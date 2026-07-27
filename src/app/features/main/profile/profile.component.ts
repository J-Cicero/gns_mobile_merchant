import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ViewWillEnter } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { MerchantService } from '../../../core/services/merchant.service';
import { MerchantResponse } from '../../../core/models/merchant.model';
import { Boutique } from '../../../core/models/boutique.model';
import { addIcons } from 'ionicons';
import { addOutline, storefrontOutline, locationOutline, closeOutline, navigateOutline, checkmarkCircleOutline } from 'ionicons/icons';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class ProfileComponent implements OnInit, ViewWillEnter {

  merchantProfile: MerchantResponse | null = null;
  boutiques: Boutique[] = [];
  selectedBoutiqueId: string | null = null;
  isDarkMode = false;
  isLoading = false;
  errorMessage = '';
  isAddBoutiqueModalOpen = false;
  isEditBoutiqueModalOpen = false;
  editingBoutique: Boutique | null = null;
  editLatitude: number | undefined = undefined;
  editLongitude: number | undefined = undefined;
  newBoutique: Partial<Boutique> & { latitude?: number, longitude?: number } = {
    name: '',
    description: '',
    latitude: undefined,
    longitude: undefined
  };
  isSubmittingBoutique = false;

  // ✅ État GPS
  isGettingLocation = false;
  gpsLabel = ''; // Affiche la position GPS détectée

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private merchantService: MerchantService,
    private toastController: ToastController
  ) {
    addIcons({ addOutline, storefrontOutline, locationOutline, closeOutline, navigateOutline, checkmarkCircleOutline });
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
    this.gpsLabel = '';
    this.isAddBoutiqueModalOpen = true;
  }

  closeAddBoutiqueModal() {
    this.isAddBoutiqueModalOpen = false;
    this.gpsLabel = '';
  }

  openEditBoutiqueModal(boutique: Boutique) {
    this.editingBoutique = boutique;
    this.editLatitude = boutique.latitude;
    this.editLongitude = boutique.longitude;
    this.gpsLabel = boutique.latitude && boutique.longitude
      ? `📍 ${boutique.latitude.toFixed(5)}, ${boutique.longitude.toFixed(5)}`
      : '';
    this.errorMessage = '';
    this.isEditBoutiqueModalOpen = true;
  }

  closeEditBoutiqueModal() {
    this.isEditBoutiqueModalOpen = false;
    this.editingBoutique = null;
    this.gpsLabel = '';
  }

  // ✅ Obtenir la position GPS actuelle du téléphone
  async useCurrentLocation(isEdit: boolean) {
    if (!navigator.geolocation) {
      await this.showToast('La géolocalisation n\'est pas disponible sur cet appareil.', 'warning');
      return;
    }

    this.isGettingLocation = true;
    await this.showToast('📡 Obtention de votre position GPS...', 'primary', 1500);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (isEdit) {
          this.editLatitude = lat;
          this.editLongitude = lng;
        } else {
          this.newBoutique.latitude = lat;
          this.newBoutique.longitude = lng;
        }

        this.gpsLabel = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        this.isGettingLocation = false;
        await this.showToast(`✅ Position détectée : ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
      },
      async (error) => {
        this.isGettingLocation = false;
        if (error.code === error.PERMISSION_DENIED) {
          await this.showToast('⛔ Accès à la localisation refusé. Autorisez l\'accès dans les paramètres.', 'danger');
        } else {
          await this.showToast('⚠️ Impossible d\'obtenir votre position. Réessayez.', 'warning');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  submitEditBoutique() {
    if (!this.editingBoutique || !this.editingBoutique.trackingId) return;

    this.isSubmittingBoutique = true;
    this.errorMessage = '';

    const request: Boutique = {
      ...this.editingBoutique,
      latitude: this.editLatitude,
      longitude: this.editLongitude
    };

    this.merchantService.updateBoutique(this.editingBoutique.trackingId, request).subscribe({
      next: async () => {
        this.isSubmittingBoutique = false;
        this.closeEditBoutiqueModal();
        const merchantId = this.authService.getCurrentMerchantId();
        if (merchantId) this.loadBoutiques(merchantId);
        await this.showToast('✅ Position de la boutique mise à jour !', 'success');
      },
      error: async (err) => {
        this.isSubmittingBoutique = false;
        const msg = err.error?.message || 'Erreur lors de la mise à jour.';
        await this.showToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  submitNewBoutique() {
    if (!this.newBoutique.name || !this.newBoutique.description) {
      this.showToast('Veuillez remplir le nom et la description.', 'warning');
      return;
    }

    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) return;

    this.isSubmittingBoutique = true;
    this.errorMessage = '';

    const request: any = {
      name: this.newBoutique.name,
      description: this.newBoutique.description,
      latitude: this.newBoutique.latitude,
      longitude: this.newBoutique.longitude,
      kycStatus: 'EN_ATTENTE',
      merchantTrackingId: merchantId
    };

    this.merchantService.createBoutique(request).subscribe({
      next: async () => {
        this.isSubmittingBoutique = false;
        this.closeAddBoutiqueModal();
        this.loadBoutiques(merchantId);
        await this.showToast('✅ Boutique créée avec succès !', 'success');
      },
      error: async (err) => {
        this.isSubmittingBoutique = false;
        const msg = err.error?.message || 'Erreur lors de la création.';
        await this.showToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary', duration: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'top',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
