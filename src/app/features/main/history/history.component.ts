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
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class HistoryComponent implements OnInit, ViewWillEnter {
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

  loadTransactions(event?: any) {
    if (!this.boutiqueId) {
      this.errorMessage = 'Aucune boutique sélectionnée.';
      this.isLoading = false;
      if (event) event.target.complete();
      return;
    }

    if (this.currentPage === 0) this.isLoading = true;
    this.transactionService.getSalesHistory(this.boutiqueId, this.currentPage, 20).subscribe({
      next: (res: Page<TransactionResponse>) => {
        const filtered = (res.content || []).filter(tx => tx.status === TransactionStatut.VALIDE);
        if (this.currentPage === 0) {
          this.transactions = filtered;
        } else {
          this.transactions = [...this.transactions, ...filtered];
        }
        this.totalPages = res.totalPages || 1;
        this.isLoading = false;
        this.isLoadingMore = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des transactions.';
        this.isLoading = false;
        this.isLoadingMore = false;
        if (event) event.target.complete();
      }
    });
  }

  loadMore(event: any) {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.isLoadingMore = true;
      this.loadTransactions(event);
    } else {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.currentPage = 0;
    this.loadTransactions(event);
  }

  get hasMore(): boolean {
    return this.currentPage + 1 < this.totalPages;
  }
}
