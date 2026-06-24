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
    bankTrackingId: '',
    accountNumber: ''
  };

  banques: Bank[] = []; // Use Bank model if available
  ribFile: File | null = null;

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
        this.registrationData = state.registrationData || this.registrationData;
      } catch (e) {
        console.error('Erreur lecture state', e);
      }
    }
  }

  saveState() {
    sessionStorage.setItem('merchantRegistrationState', JSON.stringify({
      currentStep: this.currentStep,
      registrationData: this.registrationData
    }));
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

  onRibSelected(event: any) {
    if (event.target.files.length > 0) {
      this.ribFile = event.target.files[0];
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
