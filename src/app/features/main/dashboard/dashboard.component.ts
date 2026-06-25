import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { trendingUpOutline, walletOutline, checkmarkCircleOutline, locationOutline, navigateOutline, personOutline, flash } from 'ionicons/icons';
import { MerchantService } from '../../../core/services/merchant.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { MerchantResponse } from '../../../core/models/merchant.model';
import { Boutique } from '../../../core/models/boutique.model';
import { Page } from '../../../core/models/page.model';
import { TransactionResponse } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class DashboardComponent implements OnInit, ViewWillEnter {

  merchantProfile: MerchantResponse | null = null;
  selectedBoutique: Boutique | null = null;
  boutiques: Boutique[] = [];

  quotaInitial = 0;
  quotaRestant = 0;
  ventesJour = 0;
  nombreVentesJour = 0;
  clientsUniques = 0;
  recentTransactions: TransactionResponse[] = []; // Declare recentTransactions

  isLoading = true;
  errorMessage = '';

  constructor(
    private merchantService: MerchantService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ trendingUpOutline, walletOutline, checkmarkCircleOutline, locationOutline, navigateOutline, personOutline, flash });
  }

  ngOnInit() {
    // Keep this empty for Ionic lifecycle management
  }

  ionViewWillEnter() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = '';
    const merchantId = this.authService.getCurrentMerchantId();

    if (!merchantId) {
      this.errorMessage = 'ID marchand introuvable. Veuillez vous reconnecter.';
      this.isLoading = false;
      return;
    }

    this.merchantService.getMerchantProfile(merchantId).subscribe({
      next: (profile) => {
        this.merchantProfile = profile;
        // Load boutiques
        this.merchantService.getBoutiquesByMerchant(merchantId).subscribe({
          next: (boutiques) => {
            this.boutiques = boutiques;
            if (this.boutiques.length > 0) {
              // Select the first boutique by default or the one stored
              const storedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
              this.selectedBoutique = storedBoutiqueId ? 
                this.boutiques.find(b => b.trackingId === storedBoutiqueId) || this.boutiques[0] : 
                this.boutiques[0];
              
              if (this.selectedBoutique) {
                this.merchantService.setSelectedBoutiqueId(this.selectedBoutique.trackingId);
                this.loadBoutiqueStats(this.selectedBoutique.trackingId);
              } else {
                this.errorMessage = 'Aucune boutique trouvée pour ce marchand.';
                this.isLoading = false;
              }
            } else {
              this.router.navigate(['/create-boutique']);
            }
          },
          error: (err) => {
            this.errorMessage = 'Erreur lors du chargement des boutiques: ' + (err.error?.message || err.message);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement du profil marchand: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  loadBoutiqueStats(boutiqueTrackingId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.merchantService.getBoutiqueById(boutiqueTrackingId).subscribe({
      next: (boutique) => {
        this.selectedBoutique = boutique;
        if (boutique.walletTrackingId) {
          // Assuming MerchantService can get wallet directly, or needs a WalletService
          // For now, let's assume getBoutiqueById returns it directly or we need a specific wallet service.
          // Re-checking backend, BoutiqueResponse contains balance and limitAmount
          this.quotaInitial = boutique.limitAmount || 0;
          this.quotaRestant = boutique.balance || 0;
        } else {
          this.quotaInitial = 0;
          this.quotaRestant = 0;
        }

        this.transactionService.getSalesHistory(boutiqueTrackingId, 0, 10).subscribe({ // Fetch recent sales
          next: (res: Page<TransactionResponse>) => {
            const today = new Date();
            const todaySales = (res.content || []).filter(tx => {
              const txDate = new Date(tx.createdAt);
              return txDate.toDateString() === today.toDateString() && tx.status === 'VALIDE';
            });
            this.ventesJour = todaySales.reduce((sum, tx) => sum + tx.amount, 0);
            this.nombreVentesJour = todaySales.length;

            this.recentTransactions = res.content || [];

            const uniqueClients = new Set(todaySales.map(tx => tx.senderTrackingId));
            this.clientsUniques = uniqueClients.size;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = 'Erreur lors du chargement des ventes: ' + (err.error?.message || err.message);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des stats de boutique: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  onBoutiqueChange(event: any) {
    const selectedId = event.detail.value;
    const newBoutique = this.boutiques.find(b => b.trackingId === selectedId);
    if (newBoutique) {
      this.selectedBoutique = newBoutique;
      this.merchantService.setSelectedBoutiqueId(selectedId);
      this.loadBoutiqueStats(selectedId);
    }
  }

  doRefresh(event: any) {
    this.loadDashboardData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
