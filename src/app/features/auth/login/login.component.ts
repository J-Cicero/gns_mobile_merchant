import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Use merchant's AuthService
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, flash, arrowForward, alertCircle } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, private navCtrl: NavController) {
    addIcons({ personOutline, lockClosedOutline, flash, arrowForward, alertCircle });
  }

  // Merchants do not have a direct registration flow from the app in this initial version.
  // goToRegister() {
  //   this.navCtrl.navigateRoot('/onboarding/registration'); 
  // }

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login({
      email: this.credentials.email,
      password: this.credentials.password
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        // For merchant app, simply navigate to dashboard if login is successful
        this.router.navigate(['/main/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Identifiants invalides. Veuillez réessayer.';
      }
    });
  }
}
