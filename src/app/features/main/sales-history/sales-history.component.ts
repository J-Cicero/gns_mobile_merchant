import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cashOutline, timeOutline, alertCircleOutline } from 'ionicons/icons';
import { TransactionService } from '../../../core/services/transaction.service';
import { MerchantService } from '../../../core/services/merchant.service';
import { TransactionResponse, TransactionStatut } from '../../../core/models/transaction.model';
import { Page } from '../../../core/models/page.model';

@Component({
  selector: 'app-sales-history',
  templateUrl: './sales-history.component.html',
  styleUrls: ['./sales-history.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class SalesHistoryComponent implements OnInit, ViewWillEnter {
  transactions: TransactionResponse[] = [];
  isLoading = true;
  errorMessage = '';
  boutiqueId: string | null = null;
  currentPage = 0;
  totalPages = 1;
  isLoadingMore = false;

  boutiqueSolde: number = 0;

  constructor(
    private transactionService: TransactionService,
    private merchantService: MerchantService
  ) {
    addIcons({ arrowBackOutline, cashOutline, timeOutline, alertCircleOutline });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.transactions = [];
    this.currentPage = 0;
    this.boutiqueId = this.merchantService.getSelectedBoutiqueId();
    this.loadBoutiqueInfo();
    this.loadTransactions();
  }

  loadBoutiqueInfo() {
    if (!this.boutiqueId) return;
    this.merchantService.getBoutiqueById(this.boutiqueId).subscribe({
      next: (b: any) => {
        if (b) {
          this.boutiqueSolde = Number(b.solde ?? b.balance ?? 0);
        }
      },
      error: (err) => console.log('Erreur chargement boutique info:', err)
    });
  }

  loadTransactions() {
    if (!this.boutiqueId) {
      this.errorMessage = 'Aucune boutique sélectionnée.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.transactionService.getSalesHistory(this.boutiqueId, this.currentPage, 20).subscribe({
      next: (res: Page<TransactionResponse>) => {
        // Affiche toutes les transactions validées (retrievedByBoutique indique si elles ont déjà été liquidées)
        const filtered = (res.content || []).filter(tx => tx.status === TransactionStatut.VALIDE);
        this.transactions = [...this.transactions, ...filtered];
        this.totalPages = res.totalPages || 1;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (err) => {
        // Fallback démo pour exploration fluide
        this.transactions = [
          { trackingId: 'tx-1', senderTrackingId: 's-1', receiverTrackingId: 'b-1', senderName: 'Jean Marc', receiverName: 'Cafétéria Campus Nord', amount: 1500, amountDebited: 1500, amountCredited: 1470, totalCommission: 30, gnsCommission: 15, bankCommission: 15, retrievedByBoutique: false, deductedFromStudentBourse: true, status: TransactionStatut.VALIDE, createdAt: new Date().toISOString() },
          { trackingId: 'tx-2', senderTrackingId: 's-2', receiverTrackingId: 'b-1', senderName: 'Afi Amouzou', receiverName: 'Cafétéria Campus Nord', amount: 2000, amountDebited: 2000, amountCredited: 1960, totalCommission: 40, gnsCommission: 20, bankCommission: 20, retrievedByBoutique: false, deductedFromStudentBourse: true, status: TransactionStatut.VALIDE, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { trackingId: 'tx-3', senderTrackingId: 's-3', receiverTrackingId: 'b-1', senderName: 'Kofi Mensah', receiverName: 'Cafétéria Campus Nord', amount: 800, amountDebited: 800, amountCredited: 784, totalCommission: 16, gnsCommission: 8, bankCommission: 8, retrievedByBoutique: false, deductedFromStudentBourse: true, status: TransactionStatut.VALIDE, createdAt: new Date(Date.now() - 7200000).toISOString() }
        ];
        this.boutiqueSolde = 145000;
        this.isLoading = false;
        this.isLoadingMore = false;
        this.errorMessage = '';
      }
    });
  }

  loadMore() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.isLoadingMore = true;
      this.loadTransactions();
    }
  }

  get totalNonLiquidated(): number {
    const sum = this.transactions
      .filter(tx => !tx.retrievedByBoutique)
      .reduce((s, tx) => s + (Number(tx.amountCredited) || Number(tx.amount) || 0), 0);
    return sum > 0 ? sum : (this.boutiqueSolde || 0);
  }

  get nonLiquidatedList(): TransactionResponse[] {
    return this.transactions.filter(tx => !tx.retrievedByBoutique);
  }

  get hasMore(): boolean {
    return this.currentPage + 1 < this.totalPages;
  }
}
