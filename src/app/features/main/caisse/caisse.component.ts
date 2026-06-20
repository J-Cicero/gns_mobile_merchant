import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ViewWillEnter } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { qrCodeOutline, cashOutline, alertCircleOutline } from 'ionicons/icons';
import { MerchantService } from '../../../core/services/merchant.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { Boutique } from '../../../core/models/boutique.model';
import { TransactionRequest } from '../../../core/models/transaction.model';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { NgxQrcodeStylingComponent } from 'ngx-qrcode-styling'; // Optional if still needed
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-caisse',
  templateUrl: './caisse.component.html',
  styleUrls: ['./caisse.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule]
})
export class CaisseComponent implements OnInit, ViewWillEnter {

  boutiques: Boutique[] = [];
  selectedBoutiqueId: string | null = null;
  amount: number | null = null;
  qrData: string = '';
  transactionTrackingId: string | null = null;

  isLoading = false;
  errorMessage = '';

  hasDevices: boolean = false;
  hasPermission: boolean = false;
  isScanning: boolean = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private merchantService: MerchantService,
    private transactionService: TransactionService,
    private authService: AuthService
  ) {
    addIcons({ qrCodeOutline, cashOutline, alertCircleOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadBoutiques();
    this.resetPayment();
  }

  loadBoutiques() {
    this.isLoading = true;
    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) {
      this.errorMessage = 'ID marchand introuvable.';
      this.isLoading = false;
      return;
    }

    this.merchantService.getBoutiquesByMerchant(merchantId).subscribe({
      next: (boutiques) => {
        this.boutiques = boutiques;
        if (this.boutiques.length > 0) {
          this.selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId() || this.boutiques[0].trackingId;
          this.merchantService.setSelectedBoutiqueId(this.selectedBoutiqueId);
        } else {
          this.errorMessage = 'Aucune boutique trouvée pour ce marchand.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des boutiques: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  startScan() {
    if (!this.selectedBoutiqueId || !this.amount || this.amount <= 0) {
      this.presentAlert('Erreur', 'Veuillez sélectionner une boutique et saisir un montant valide.');
      return;
    }
    this.isScanning = true;
  }

  stopScan() {
    this.isScanning = false;
  }

  onCodeResult(resultString: string) {
    this.isScanning = false;
    try {
      // Assuming the student's QR is a JSON or just a tracking ID string.
      // If it's the JSON payload from student app: {"type":"PAYMENT","senderTrackingId":"..."}
      let studentTrackingId = resultString;
      if (resultString.startsWith('{')) {
        const payload = JSON.parse(resultString);
        studentTrackingId = payload.senderTrackingId || payload.studentTrackingId;
      }

      this.processPayment(studentTrackingId);
    } catch (e) {
      // If not JSON, assume it's directly the ID
      this.processPayment(resultString);
    }
  }

  onHasDevices(has: boolean) {
    this.hasDevices = has;
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  async processPayment(studentTrackingId: string) {
    this.isLoading = true;
    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) {
      this.errorMessage = 'ID marchand introuvable.';
      this.isLoading = false;
      return;
    }

    const transactionRequest: TransactionRequest = {
      senderTrackingId: studentTrackingId, // Student pays
      receiverTrackingId: this.selectedBoutiqueId!, // Boutique receives
      amount: this.amount!,
      password: '' // Usually requires a password/PIN from the student, but since merchant scans, maybe no PIN, or the backend must handle this.
    };

    this.transactionService.initiatePayment(transactionRequest).subscribe({
      next: async (res: any) => {
        this.isLoading = false;
        await this.presentAlert('Succès', 'Paiement effectué avec succès !');
        this.resetPayment();
        this.router.navigate(['/main/dashboard']);
      },
      error: async (err: any) => {
        this.isLoading = false;
        await this.presentAlert('Erreur', 'Erreur lors du paiement: ' + (err.error?.message || err.message));
      }
    });
  }

  resetPayment() {
    this.amount = null;
    this.isScanning = false;
    this.errorMessage = '';
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
