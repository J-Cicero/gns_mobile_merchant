import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ViewWillEnter } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { qrCodeOutline, cashOutline, alertCircleOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { MerchantService } from '../../../core/services/merchant.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { Boutique } from '../../../core/models/boutique.model';
import { TransactionRequest } from '../../../core/models/transaction.model';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-caisse',
  templateUrl: './caisse.component.html',
  styleUrls: ['./caisse.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule]
})
export class CaisseComponent implements OnInit, OnDestroy, ViewWillEnter {

  boutiques: Boutique[] = [];
  selectedBoutiqueId: string | null = null;
  amount: number | null = null;
  qrData: string = '';
  transactionTrackingId: string | null = null;
  scannedStudentId: string | null = null;
  scannedStudentName: string | null = null; // Nom affiché après scan
  studentPin: string = '';

  isLoading = false;
  errorMessage = '';;
  hasDevices: boolean = false;
  hasPermission: boolean = false;
  isScanning: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE];

  // ✅ Gestion PIN modal
  isPinModalOpen: boolean = false;
  pinAttempts: number = 0;
  readonly maxPinAttempts = 3;

  // ✅ Flag pour éviter la réutilisation du scan
  qrAlreadyUsed: boolean = false;

  private boutiqueSub?: Subscription;

  constructor(
    private router: Router,
    private merchantService: MerchantService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({ qrCodeOutline, cashOutline, alertCircleOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.boutiqueSub = this.merchantService.selectedBoutiqueId$
      .pipe(distinctUntilChanged())
      .subscribe(id => {
        if (id) {
          this.selectedBoutiqueId = id;
          this.resetPayment();
        }
      });
  }

  ionViewWillEnter() {
    this.selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (!this.selectedBoutiqueId) {
      this.loadBoutiques();
    }
    this.resetPayment();
  }

  ngOnDestroy() {
    this.boutiqueSub?.unsubscribe();
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

  async startScan() {
    if (!this.selectedBoutiqueId || !this.amount || this.amount <= 0) {
      await this.showToast('Veuillez saisir un montant valide.', 'warning', 'alert-circle-outline');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      this.isScanning = true;
      this.qrAlreadyUsed = false; // ✅ Reset du flag à chaque nouveau scan
    } catch (err) {
      await this.showToast("Veuillez autoriser l'accès à la caméra pour scanner le QR code.", 'danger', 'alert-circle-outline');
    }
  }

  stopScan() {
    this.isScanning = false;
  }

  async onCodeResult(resultString: string) {
    // ✅ Un seul scan par paiement
    if (this.qrAlreadyUsed) return;
    this.qrAlreadyUsed = true;
    this.isScanning = false;

    try {
      let studentTrackingId = resultString;
      let studentName = 'l\'étudiant';

      if (resultString.startsWith('{')) {
        const payload = JSON.parse(resultString);

        if (payload.type !== 'PAYMENT') {
          await this.showToast('QR Code non valide pour un paiement.', 'danger', 'alert-circle-outline');
          this.qrAlreadyUsed = false;
          return;
        }
        studentTrackingId = payload.studentId || payload.senderTrackingId || payload.studentTrackingId;
        // Récupérer le nom si présent dans le payload
        if (payload.firstName || payload.name) {
          studentName = payload.firstName ? `${payload.firstName} ${payload.lastName || ''}`.trim() : payload.name;
        }
      }

      if (!studentTrackingId) {
        await this.showToast('QR Code invalide ou illisible. Veuillez réessayer.', 'danger', 'alert-circle-outline');
        this.qrAlreadyUsed = false;
        return;
      }

      this.scannedStudentId = studentTrackingId;
      this.scannedStudentName = studentName;

      // ✅ Toast de confirmation de scan
      await this.showToast(
        `✅ QR Code de ${studentName} scanné avec succès`,
        'success',
        'checkmark-circle-outline',
        2000
      );

      // ✅ Ouvrir le modal PIN directement
      this.pinAttempts = 0;
      this.studentPin = '';
      this.isPinModalOpen = true;

    } catch (e) {
      // Si le résultat n'est pas du JSON, c'est directement l'ID
      if (resultString && resultString.trim().length > 0) {
        this.scannedStudentId = resultString.trim();
        this.scannedStudentName = 'l\'étudiant';
        await this.showToast(`✅ QR Code scanné avec succès`, 'success', 'checkmark-circle-outline', 2000);
        this.pinAttempts = 0;
        this.studentPin = '';
        this.isPinModalOpen = true;
      } else {
        await this.showToast('QR Code invalide. Veuillez réessayer.', 'danger', 'alert-circle-outline');
        this.qrAlreadyUsed = false;
      }
    }
  }

  closePinModal() {
    this.isPinModalOpen = false;
    this.studentPin = '';
    this.scannedStudentId = null;
    this.scannedStudentName = null;
    this.qrAlreadyUsed = false;
    this.pinAttempts = 0;
  }

  onHasDevices(devices: MediaDeviceInfo[]) {
    this.hasDevices = devices && devices.length > 0;
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  get remainingAttempts(): number {
    return this.maxPinAttempts - this.pinAttempts;
  }

  async processPayment() {
    if (!this.studentPin || this.studentPin.length < 4) {
      await this.showToast('Veuillez saisir le code PIN (4 chiffres minimum).', 'warning', 'alert-circle-outline');
      return;
    }

    this.isLoading = true;
    const merchantId = this.authService.getCurrentMerchantId();
    if (!merchantId) {
      this.isLoading = false;
      await this.showToast('ID marchand introuvable.', 'danger', 'alert-circle-outline');
      return;
    }

    const transactionRequest: TransactionRequest = {
      senderTrackingId: this.scannedStudentId!,
      receiverTrackingId: this.selectedBoutiqueId!,
      amount: this.amount!,
      transactionPin: this.studentPin
    };

    this.transactionService.initiatePayment(transactionRequest).subscribe({
      next: async (res: any) => {
        this.isLoading = false;
        // ✅ Fermer le modal PIN immédiatement après succès
        this.isPinModalOpen = false;
        await this.showToast(
          `✅ Paiement de ${this.amount} FCFA effectué avec succès !`,
          'success',
          'checkmark-circle-outline',
          3000
        );
        this.resetPayment();
      },
      error: async (err: any) => {
        this.isLoading = false;
        this.pinAttempts++;

        const errMsg = err.error?.message || err.message || 'Erreur inconnue';

        // ✅ Vérifier si c'est une erreur "étudiant introuvable"
        const isStudentNotFound = errMsg.toLowerCase().includes('étudiant') ||
          errMsg.toLowerCase().includes('student') ||
          errMsg.toLowerCase().includes('not found') ||
          err.status === 404;

        if (isStudentNotFound) {
          // ✅ QR invalide : fermer le modal, reset, message clair
          this.isPinModalOpen = false;
          await this.showToast(
            `❌ Ce QR code n'appartient à aucun étudiant. Veuillez vérifier et réessayer.`,
            'danger',
            'close-circle-outline',
            4000
          );
          this.resetPayment();
          return;
        }

        if (this.pinAttempts >= this.maxPinAttempts) {
          // ✅ 3 tentatives épuisées : fermer le modal automatiquement
          this.isPinModalOpen = false;
          await this.showToast(
            `❌ 3 tentatives incorrectes. Paiement annulé.`,
            'danger',
            'close-circle-outline',
            3500
          );
          this.resetPayment();
        } else {
          // ✅ Message avec tentatives restantes
          this.studentPin = '';
          await this.showToast(
            `PIN incorrect — ${this.remainingAttempts} tentative(s) restante(s)`,
            'warning',
            'alert-circle-outline',
            2500
          );
        }
      }
    });
  }

  resetPayment() {
    this.amount = null;
    this.isScanning = false;
    this.scannedStudentId = null;
    this.scannedStudentName = null;
    this.studentPin = '';
    this.errorMessage = '';
    this.isPinModalOpen = false;
    this.pinAttempts = 0;
    this.qrAlreadyUsed = false;
  }

  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary',
    icon?: string,
    duration: number = 2500
  ) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'top',
      icon,
      cssClass: 'custom-toast',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
