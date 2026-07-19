import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonRefresher, IonRefresherContent, IonIcon, ViewWillEnter  } from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { trendingUpOutline, walletOutline, checkmarkCircleOutline, locationOutline, navigateOutline, personOutline, flash, cashOutline } from 'ionicons/icons';
import { MerchantService } from '../../../core/services/merchant.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { MerchantResponse } from '../../../core/models/merchant.model';
import { Boutique } from '../../../core/models/boutique.model';
import { Page } from '../../../core/models/page.model';
import { TransactionResponse } from '../../../core/models/transaction.model';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonRefresher, IonRefresherContent, IonIcon, RouterModule]
})
export class DashboardComponent implements OnInit, OnDestroy, ViewWillEnter {

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
  private boutiqueSub?: Subscription;

  constructor(
    private merchantService: MerchantService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ trendingUpOutline, walletOutline, checkmarkCircleOutline, locationOutline, navigateOutline, personOutline, flash });
  }

  ngOnInit() {
    this.boutiqueSub = this.merchantService.selectedBoutiqueId$
      .pipe(distinctUntilChanged())
      .subscribe(id => {
        if (id && this.selectedBoutique && this.selectedBoutique.trackingId !== id) {
          this.loadBoutiqueStats(id);
        }
      });
  }

  ionViewWillEnter() {
    this.loadDashboardData();
  }

  ngOnDestroy() { this.boutiqueSub?.unsubscribe(); }

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

        // ✅ Afficher le solde immédiatement dès réception des données boutique
        this.quotaInitial = Number((boutique as any).plafond ?? boutique.limitAmount) || 0;
        this.quotaRestant = Number((boutique as any).solde ?? boutique.balance) || 0;

        console.log('[Dashboard] Boutique chargée:', boutique.name, '| Balance:', this.quotaRestant, '| Limit:', this.quotaInitial);

        // ✅ Arrêter le loader maintenant - le solde est disponible
        this.isLoading = false;

        // Charger les transactions séparément (ne bloque pas l'affichage)
        this.loadSalesStats(boutiqueTrackingId);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des stats de boutique: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  loadSalesStats(boutiqueTrackingId: string) {
    this.transactionService.getSalesHistory(boutiqueTrackingId, 0, 10).subscribe({
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
      },
      error: (err) => {
        // Ne pas bloquer l'UI si les transactions échouent
        console.warn('[Dashboard] Erreur chargement transactions:', err.error?.message || err.message);
        this.recentTransactions = [];
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
