import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  documentTextOutline, closeOutline, cashOutline, checkboxOutline,
  squareOutline, chevronForwardOutline, trendingUpOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-liquidation',
  templateUrl: './liquidation.component.html',
  styleUrls: ['./liquidation.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class LiquidationComponent implements OnInit, ViewWillEnter {

  boutiqueBalance: number = 0;
  boutiqueName: string = '';
  
  /** Toutes les ventes non encore liquidées (retrievedByBoutique == false) */
  pendingTransactions: TransactionResponse[] = [];
  
  /** IDs des transactions sélectionnées par le marchand */
  selectedIds: Set<string> = new Set();
  
  isLoading = true;
  isSubmitting = false;
  selectedBoutiqueId: string | null = null;

  showReceipt: boolean = false;
  lastLiquidation: LiquidationResponse | null = null;
  liquidationHistory: LiquidationResponse[] = [];

  constructor(
    private merchantService: MerchantService,
    private transactionService: TransactionService,
    private liquidationService: LiquidationService,
    private toastController: ToastController
  ) {
    addIcons({
      walletOutline, timeOutline, checkmarkCircleOutline, alertCircleOutline,
      documentTextOutline, closeOutline, cashOutline, checkboxOutline,
      squareOutline, chevronForwardOutline, trendingUpOutline
    });
  }

  ngOnInit() {
    this.selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (this.selectedBoutiqueId) {
      this.loadData();
    } else {
      this.isLoading = false;
    }
  }

  ionViewWillEnter() {
    this.selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (this.selectedBoutiqueId) {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;
    this.selectedIds.clear();

    this.merchantService.getBoutiqueById(this.selectedBoutiqueId!).subscribe({
      next: (boutique) => {
        this.boutiqueBalance = Number((boutique as any).solde ?? boutique.balance) || 0;
        this.boutiqueName = boutique.name || '';
        this.loadLiquidationHistory();

        this.transactionService.getSalesHistory(this.selectedBoutiqueId!, 0, 100).subscribe({
          next: (res: Page<TransactionResponse>) => {
            // Transactions VALIDE non encore liquidées (retrievedByBoutique == false ou absent)
            this.pendingTransactions = (res.content || []).filter(
              (tx: any) => tx.status === 'VALIDE' && !(tx.retrievedByBoutique)
            );
            this.isLoading = false;
          },
          error: () => { this.isLoading = false; }
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
        if (res && res.content) this.liquidationHistory = res.content;
        else if (Array.isArray(res)) this.liquidationHistory = res;
        else this.liquidationHistory = [];
      },
      error: () => { this.liquidationHistory = []; }
    });
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedIds.clear();
    } else {
      this.pendingTransactions.forEach(tx => this.selectedIds.add(tx.trackingId));
    }
  }

  toggleTransaction(txId: string) {
    if (this.selectedIds.has(txId)) {
      this.selectedIds.delete(txId);
    } else {
      this.selectedIds.add(txId);
    }
  }

  isSelected(txId: string): boolean {
    return this.selectedIds.has(txId);
  }

  get allSelected(): boolean {
    return this.pendingTransactions.length > 0 && this.selectedIds.size === this.pendingTransactions.length;
  }

  get selectedTransactions(): TransactionResponse[] {
    return this.pendingTransactions.filter(tx => this.selectedIds.has(tx.trackingId));
  }

  get selectedTotal(): number {
    return this.selectedTransactions.reduce((sum, tx) => sum + ((tx as any).amountCredited || tx.amount || 0), 0);
  }

  get totalPending(): number {
    return this.pendingTransactions.reduce((sum, tx) => sum + ((tx as any).amountCredited || tx.amount || 0), 0);
  }

  requestLiquidation() {
    if (this.selectedIds.size === 0 || !this.selectedBoutiqueId) return;

    this.isSubmitting = true;
    const request: LiquidationRequest = {
      amountToLiquidate: this.selectedTotal,
      boutiqueTrackingId: this.selectedBoutiqueId
    };

    this.merchantService.requestLiquidation(request).subscribe({
      next: (response: LiquidationResponse) => {
        this.isSubmitting = false;
        this.lastLiquidation = response;
        this.showReceipt = true;
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showToast(err.error?.message || 'Erreur lors de la demande de liquidation', 'danger');
      }
    });
  }

  closeReceipt() { this.showReceipt = false; }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message, duration: 3000, color, position: 'top',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    toast.present();
  }

  doRefresh(event: any) {
    this.loadData();
    setTimeout(() => event.target.complete(), 1200);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'VALIDEE': return 'Validée';
      case 'REJETEE': return 'Rejetée';
      default: return status;
    }
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value || 0);
  }
}

