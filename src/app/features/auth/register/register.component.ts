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
    businessName: '',
    registrationNumber: '',
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
  }

  loadBanques() {
    this.merchantService.getBanks().subscribe({
      next: (res: Bank[]) => { // Assuming getBanks returns an array of Bank
        this.banques = res;
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
      if (!this.registrationData.firstName || !this.registrationData.lastName || !this.registrationData.email || !this.registrationData.phoneNumber || !this.registrationData.password) {
        this.errorMessage = 'Veuillez remplir vos informations personnelles.';
        return;
      }
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      // Bank is optional but if selected need details
      if (this.registrationData.bankTrackingId && (!this.registrationData.accountNumber || !this.ribFile)) {
        this.errorMessage = 'Veuillez fournir un numéro de compte et le fichier RIB.';
        return;
      }
      this.currentStep = 3;
    }
  }

  prevStep() {
    this.errorMessage = '';
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit() {
    if (this.currentStep === 3) {
      if (!this.registrationData.businessName) {
        this.errorMessage = 'Veuillez renseigner le nom de votre boutique.';
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      this.merchantService.registerMerchant(this.registrationData, this.ribFile || undefined).subscribe({
        next: (res) => {
          // Attempt to log in the new merchant
          this.authService.login({
            email: this.registrationData.email,
            password: this.registrationData.password!
          }).subscribe({
            next: (loginRes) => {
              this.isSubmitting = false;
              // Navigate to dashboard or appropriate post-registration page
              this.router.navigate(['/main/dashboard']);
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
}
