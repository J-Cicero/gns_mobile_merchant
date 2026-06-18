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
import { NgxQrcodeStylingComponent } from 'ngx-qrcode-styling'; // Corrected import
import { environment } from '../../../../environments/environment'; // Import environment

@Component({
  selector: 'app-caisse',
  templateUrl: './caisse.component.html',
  styleUrls: ['./caisse.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, NgxQrcodeStylingComponent] // Corrected import
})
export class CaisseComponent implements OnInit, ViewWillEnter {

  boutiques: Boutique[] = [];
  selectedBoutiqueId: string | null = null;
  amount: number | null = null;
  qrData: string = '';
  transactionTrackingId: string | null = null;

  isLoading = false;
  errorMessage = '';

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
    // ngOnInit is called once when the component is initialized.
    // For data that needs to refresh when entering the view, use ionViewWillEnter.
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

  async generatePaymentQrCode() {
    if (!this.selectedBoutiqueId || !this.amount || this.amount <= 0) {
      await this.presentAlert('Erreur', 'Veuillez sélectionner une boutique et saisir un montant valide.');
      return;
    }

    this.isLoading = true;
    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) {
      this.errorMessage = 'ID marchand introuvable.';
      this.isLoading = false;
      return;
    }

    const transactionRequest: TransactionRequest = {
      senderTrackingId: merchantId, // Merchant is the sender in this context (initiating payment request)
      receiverTrackingId: this.selectedBoutiqueId, // Boutique is the receiver
      amount: this.amount,
      // No password needed here, as this creates a PENDING transaction for the student to pay.
      // isCommissionPaid and isRetry should be defaulted by backend.
    };

    // Assuming the backend endpoint for QR payment initiation is different or the createPayment needs a flag
    // For now, I'll use initiatePayment and assume backend sets status to PENDING if no password
    // Backend's createPayment immediately validates. Need a specific backend endpoint for PENDING transactions.
    // Given the demo, let's make it simple: `initiatePayment` is for actual payment, here we generate QR data.
    // This implies a new backend endpoint `POST /transactions/initiate-qr-payment` which returns a PENDING transaction ID.
    // For now, let's assume `initiatePayment` will be called by the student. Here we just generate QR data.
    // If the backend `createPayment` sets status to VALIDE immediately, this part of the flow needs careful backend re-design.

    // TEMPORARY: Just generate QR data with a dummy transaction ID for demo purposes, 
    // without creating a backend transaction yet, as createPayment validates immediately.
    this.transactionTrackingId = 'dummy-txn-' + Math.random().toString(36).substring(7);

    this.qrData = JSON.stringify({
      type: 'PAYMENT_REQUEST',
      boutiqueId: this.selectedBoutiqueId,
      amount: this.amount,
      // transactionId: this.transactionTrackingId, // Will be real ID from backend later
      callbackUrl: `${environment.apiUrl}/transactions/pay-by-qr` // Student app would call this
    });

    this.isLoading = false;
    await this.presentAlert('QR Code Généré', 'Le QR code est prêt pour le paiement.');
  }

  resetPayment() {
    this.amount = null;
    this.qrData = '';
    this.transactionTrackingId = null;
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
