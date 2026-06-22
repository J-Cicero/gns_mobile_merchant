import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { MerchantService } from '../../../core/services/merchant.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { LiquidationRequest } from '../../../core/models/liquidation.model';
import { TransactionResponse } from '../../../core/models/transaction.model';
import { Page } from '../../../core/models/page.model';
import { addIcons } from 'ionicons';
import { walletOutline, timeOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-liquidation',
  templateUrl: './liquidation.component.html',
  styleUrls: ['./liquidation.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LiquidationComponent implements OnInit {

  montantDisponible: number = 0;
  pendingTransactions: TransactionResponse[] = [];
  isLoading = true;
  isSubmitting = false;
  selectedBoutiqueId: string | null = null;

  constructor(
    private merchantService: MerchantService,
    private transactionService: TransactionService,
    private toastController: ToastController
  ) {
    addIcons({ walletOutline, timeOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (this.selectedBoutiqueId) {
      this.loadLiquidationData();
    } else {
      this.isLoading = false;
    }
  }

  loadLiquidationData() {
    this.isLoading = true;
    
    // First, let's load the boutique to get balance/wallet info
    this.merchantService.getBoutiqueById(this.selectedBoutiqueId!).subscribe({
      next: (boutique) => {
        this.montantDisponible = boutique.balance || 0;
        
        // Load pending transactions or sales history
        this.transactionService.getSalesHistory(this.selectedBoutiqueId!, 0, 20).subscribe({
          next: (res: Page<TransactionResponse>) => {
            // For UI purposes, we'll assume we show the recent ones.
            // Ideally backend filters by status, but we'll show them and style them.
            this.pendingTransactions = res.content || [];
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
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
      next: () => {
        this.isSubmitting = false;
        this.showToast('Demande de liquidation envoyée avec succès', 'success');
        this.loadLiquidationData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showToast(err.error?.message || 'Erreur lors de la demande de liquidation', 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }

  doRefresh(event: any) {
    this.loadLiquidationData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
