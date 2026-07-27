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
    this.loadTransactions();
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
        // Filter: only VALIDE transactions that are NOT yet liquidated (isCommissionPaid = false means not yet settled)
        const filtered = (res.content || []).filter(tx => tx.status === TransactionStatut.VALIDE);
        this.transactions = [...this.transactions, ...filtered];
        this.totalPages = res.totalPages || 1;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des transactions.';
        this.isLoading = false;
        this.isLoadingMore = false;
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
    // ✅ Traiter null comme false (backend peut retourner null au lieu de false)
    return this.transactions
      .filter(tx => !tx.isCommissionPaid || tx.isCommissionPaid === null)
      .reduce((sum, tx) => sum + (tx.amountCredited || tx.amount || 0), 0);
  }

  get nonLiquidatedList(): TransactionResponse[] {
    // ✅ Inclure les transactions où isCommissionPaid est null ou false
    return this.transactions.filter(tx => !tx.isCommissionPaid || (tx.isCommissionPaid as any) === null);
  }

  get hasMore(): boolean {
    return this.currentPage + 1 < this.totalPages;
  }
}
