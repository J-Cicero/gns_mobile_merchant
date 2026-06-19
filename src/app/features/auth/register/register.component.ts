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

  onSubmit() {
    // Basic validation
    if (!this.registrationData.firstName || !this.registrationData.lastName || !this.registrationData.email || !this.registrationData.phoneNumber || !this.registrationData.password || !this.registrationData.businessName) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.registrationData.bankTrackingId && (!this.registrationData.accountNumber || !this.ribFile)) {
      this.errorMessage = 'Veuillez fournir un numéro de compte et le fichier RIB pour la banque sélectionnée.';
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
