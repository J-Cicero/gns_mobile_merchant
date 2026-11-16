import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MerchantService } from '../../../core/services/merchant.service';
import { AuthService } from '../../../core/services/auth.service';
import { MerchantRequest } from '../../../core/models/merchant.model';
import { Bank } from '../../../core/models/bank.model'; // Assuming a Bank model exists or will be created

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RegisterComponent implements OnInit {

  currentStep = 1;
  registrationData: MerchantRequest = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    birthDate: '',
    birthPlace: '',
    businessName: '',
    registrationNumber: '',
    bankTrackingId: '',
    accountNumber: ''
  };

  banques: Bank[] = []; // Use Bank model if available
  ribFile: File | null = null;
  ribPreviewUrl: string | null = null;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private merchantService: MerchantService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadBanques();

    // Restauration de l'état en cas de rafraîchissement (ex: lors du choix de fichier sur mobile)
    const savedState = sessionStorage.getItem('merchantRegistrationState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.currentStep = state.currentStep || 1;
        this.registrationData = { ...this.registrationData, ...(state.registrationData || {}) };
        if (state.ribDataUrl && state.ribFileName) {
          this.ribFile = this.dataUrlToFile(state.ribDataUrl, state.ribFileName, state.ribMimeType || 'image/jpeg');
          if ((state.ribMimeType || '').startsWith('image/')) {
            this.ribPreviewUrl = state.ribDataUrl;
          }
        }
      } catch (e) {
        console.error('Erreur lecture state', e);
      }
    }
  }

  saveState() {
    try {
      const existingRaw = sessionStorage.getItem('merchantRegistrationState');
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      sessionStorage.setItem('merchantRegistrationState', JSON.stringify({
        ...existing,
        currentStep: this.currentStep,
        registrationData: this.registrationData
      }));
    } catch (e) {
      console.warn('Impossible de sauvegarder merchantRegistrationState', e);
    }
  }

  private dataUrlToFile(dataUrl: string, filename: string, mimeType: string): File {
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1] || '');
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mimeType });
  }

  private processSelectedFile(rawFile: File): Promise<{ file: File; dataUrl: string | null }> {
    return new Promise((resolve) => {
      if (!rawFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === 'string' && rawFile.size <= 2 * 1024 * 1024 ? reader.result : null;
          resolve({ file: rawFile, dataUrl });
        };
        reader.onerror = () => resolve({ file: rawFile, dataUrl: null });
        reader.readAsDataURL(rawFile);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ file: rawFile, dataUrl: e.target.result });
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          const cleanName = `rib_merchant_${Date.now()}.jpg`;
          const compressedFile = this.dataUrlToFile(compressedDataUrl, cleanName, 'image/jpeg');
          resolve({ file: compressedFile, dataUrl: compressedDataUrl });
        };
        img.onerror = () => resolve({ file: rawFile, dataUrl: null });
        img.src = e.target.result;
      };
      reader.onerror = () => resolve({ file: rawFile, dataUrl: null });
      reader.readAsDataURL(rawFile);
    });
  }

  loadBanques() {
    this.merchantService.getBanks().subscribe({
      next: (res: any) => {
        this.banques = Array.isArray(res) ? res : (res.content || []);
      },
      error: (err: any) => {
        console.error('Erreur chargement banques', err);
        this.errorMessage = 'Erreur lors du chargement des banques.';
      }
    });
  }

  async onRibSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const rawFile = input.files[0];
      this.saveState();
      const { file, dataUrl } = await this.processSelectedFile(rawFile);
      this.ribFile = file;
      this.ribPreviewUrl = file.type.startsWith('image/') ? dataUrl : null;
      try {
        const existingRaw = sessionStorage.getItem('merchantRegistrationState');
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        existing.currentStep = this.currentStep;
        existing.registrationData = this.registrationData;
        existing.ribDataUrl = dataUrl;
        existing.ribFileName = file.name;
        existing.ribMimeType = file.type;
        sessionStorage.setItem('merchantRegistrationState', JSON.stringify(existing));
      } catch (e) {
        console.warn('Stockage session limité pour rib marchand', e);
      }
    }
  }

  goToLogin() {
    this.navCtrl.navigateRoot('/auth/login');
  }

  nextStep() {
    this.errorMessage = '';
    if (this.currentStep === 1) {
      if (!this.registrationData.firstName || !this.registrationData.lastName || !this.registrationData.email || !this.registrationData.phoneNumber || !this.registrationData.password || !this.registrationData.birthDate || !this.registrationData.birthPlace) {
        this.errorMessage = 'Veuillez remplir toutes les informations personnelles.';
        return;
      }
      this.currentStep = 2;
      this.saveState();
    } else if (this.currentStep === 2) {
      if (!this.registrationData.businessName) {
        this.errorMessage = 'Veuillez renseigner le nom de votre boutique / commerce.';
        return;
      }
      // Si la banque est remplie, vérifier que le numéro de compte et le RIB sont présents
      if (this.registrationData.bankTrackingId && (!this.registrationData.accountNumber || !this.ribFile)) {
        this.errorMessage = 'Veuillez fournir un numéro de compte et le fichier RIB.';
        return;
      }
      this.onSubmit(); // On soumet directement à la fin de l'étape 2 !
    }
  }

  prevStep() {
    this.errorMessage = '';
    if (this.currentStep > 1) {
      this.currentStep--;
      this.saveState();
    }
  }

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';

    // Adjust payload structure since birthDate might need formatting
    const payload: any = { ...this.registrationData };
    if (payload.birthDate) {
      payload.birthDate = `${payload.birthDate}T00:00:00`;
    }

    this.merchantService.registerMerchant(payload as MerchantRequest, this.ribFile || undefined).subscribe({
      next: (res) => {
        sessionStorage.removeItem('merchantRegistrationState'); // Nettoyage
        // Tentative de connexion automatique
        this.authService.login({
          email: this.registrationData.email,
          password: this.registrationData.password!
        }).subscribe({
          next: (loginRes) => {
            this.isSubmitting = false;
            // Redirection vers select-boutique qui demandera la création
            this.router.navigate(['/main/select-boutique']);
          },
          error: (loginErr) => {
            this.isSubmitting = false;
            this.errorMessage = 'Compte créé mais connexion automatique échouée. Veuillez vous connecter manuellement.';
            setTimeout(() => this.router.navigate(['/auth/login']), 2000);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création du compte marchand. Veuillez réessayer.';
        console.error('Registration error', err);
      }
    });
  }
}
