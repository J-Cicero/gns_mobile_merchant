import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ViewWillEnter } from '@ionic/angular';
import { MerchantService } from '../../../core/services/merchant.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { LiquidationService } from '../../../core/services/liquidation.service';
import { LiquidationRequest, LiquidationResponse } from '../../../core/models/liquidation.model';
import { TransactionResponse } from '../../../core/models/transaction.model';
import { Page } from '../../../core/models/page.model';
import { addIcons } from 'ionicons';
import {
  walletOutline, timeOutline, checkmarkCircleOutline, alertCircleOutline,
  documentTextOutline, printOutline, closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-liquidation',
  templateUrl: './liquidation.component.html',
  styleUrls: ['./liquidation.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LiquidationComponent implements OnInit, ViewWillEnter {

  montantDisponible: number = 0;
  boutiqueName: string = '';
  pendingTransactions: TransactionResponse[] = [];
  isLoading = true;
  isSubmitting = false;
  selectedBoutiqueId: string | null = null;

  // ✅ Reçu après liquidation réussie
  showReceipt: boolean = false;
  lastLiquidation: LiquidationResponse | null = null;

  // Historique des liquidations de la boutique
  liquidationHistory: LiquidationResponse[] = [];

  constructor(
    private merchantService: MerchantService,
    private transactionService: TransactionService,
    private liquidationService: LiquidationService,
    private toastController: ToastController
  ) {
    addIcons({
      walletOutline, timeOutline, checkmarkCircleOutline, alertCircleOutline,
      documentTextOutline, printOutline, closeOutline
    });
  }

  ngOnInit() {
    this.selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (this.selectedBoutiqueId) {
      this.loadLiquidationData();
    } else {
      this.isLoading = false;
    }
  }

  ionViewWillEnter() {
    this.selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (this.selectedBoutiqueId) {
      this.loadLiquidationData();
    }
  }

  loadLiquidationData() {
    this.isLoading = true;

    this.merchantService.getBoutiqueById(this.selectedBoutiqueId!).subscribe({
      next: (boutique) => {
        // ✅ Corriger le mapping du solde (même pattern que le dashboard)
        this.montantDisponible = Number((boutique as any).solde ?? boutique.balance) || 0;
        this.boutiqueName = boutique.name || '';

        console.log('[Liquidation] Solde boutique:', this.montantDisponible, 'FCFA');

        // Charger l'historique des liquidations
        this.loadLiquidationHistory();

        // Charger les transactions non liquidées
        this.transactionService.getSalesHistory(this.selectedBoutiqueId!, 0, 20).subscribe({
          next: (res: Page<TransactionResponse>) => {
            // Transactions VALIDE et non encore liquidées
            this.pendingTransactions = (res.content || []).filter(
              tx => tx.status === 'VALIDE' && (!tx.isCommissionPaid || (tx.isCommissionPaid as any) === null)
            );
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Erreur lors du chargement des données.', 'danger');
      }
    });
  }

  loadLiquidationHistory() {
    if (!this.selectedBoutiqueId) return;
    this.liquidationService.findByBoutiqueId(this.selectedBoutiqueId).subscribe({
      next: (res: any) => {
        // Peut être un tableau ou un objet Page
        if (res && res.content) {
          this.liquidationHistory = res.content;
        } else if (Array.isArray(res)) {
          this.liquidationHistory = res;
        } else {
          this.liquidationHistory = [];
        }
      },
      error: () => {
        this.liquidationHistory = [];
      }
    });
  }

  requestLiquidation() {
    if (this.montantDisponible <= 0 || !this.selectedBoutiqueId) return;

    this.isSubmitting = true;
    const request: LiquidationRequest = {
      amountToLiquidate: this.montantDisponible,
      boutiqueTrackingId: this.selectedBoutiqueId
    };

    this.merchantService.requestLiquidation(request).subscribe({
      next: (response: LiquidationResponse) => {
        this.isSubmitting = false;
        // ✅ Stocker la réponse et afficher le reçu
        this.lastLiquidation = response;
        this.showReceipt = true;
        this.loadLiquidationData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showToast(err.error?.message || 'Erreur lors de la demande de liquidation', 'danger');
      }
    });
  }

  closeReceipt() {
    this.showReceipt = false;
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    toast.present();
  }

  doRefresh(event: any) {
    this.loadLiquidationData();
    setTimeout(() => {
      event.target.complete();
    }, 1200);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'VALIDEE': return 'Validée';
      case 'REJETEE': return 'Rejetée';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'amber';
      case 'VALIDEE': return 'emerald';
      case 'REJETEE': return 'red';
      default: return 'slate';
    }
  }
}
