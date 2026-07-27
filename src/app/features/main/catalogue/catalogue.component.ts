import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ViewWillEnter } from '@ionic/angular';
import { MerchantService } from '../../../core/services/merchant.service';
import { Produit } from '../../../core/models/boutique.model';
import { ProductRequest } from '../../../core/models/product.model';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CatalogueComponent implements OnInit, OnDestroy, ViewWillEnter {

  produits: Produit[] = [];
  isLoading = false;
  errorMessage = '';

  // Modaux séparés pour éviter les conflits
  isAddModalOpen = false;
  isEditModalOpen = false;
  newProduct: Partial<ProductRequest> = { name: '', description: '', price: 0, isAvailable: true };
  selectedProductId: string | null = null;
  isSubmittingProduct = false;
  isTogglingId: string | null = null; // Produit en cours de basculement

  constructor(
    private merchantService: MerchantService,
    private toastController: ToastController
  ) { }
  private boutiqueSub?: Subscription;

  ngOnInit() {
    this.boutiqueSub = this.merchantService.selectedBoutiqueId$
      .pipe(distinctUntilChanged())
      .subscribe(id => { if (id) this.loadProducts(); });
  }

  ngOnDestroy() { this.boutiqueSub?.unsubscribe(); }

  ionViewWillEnter() {
    this.loadProducts();
  }

  loadProducts() {
    const selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (!selectedBoutiqueId) {
      this.errorMessage = 'Veuillez sélectionner une boutique dans le Dashboard ou le Profil.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.merchantService.getProducts(selectedBoutiqueId).subscribe({
      next: (res) => {
        this.produits = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur de chargement des produits.';
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    const selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (!selectedBoutiqueId) {
      this.showToast('Veuillez sélectionner une boutique avant d\'ajouter un produit.', 'warning');
      return;
    }
    this.newProduct = { name: '', description: '', price: 0, isAvailable: true };
    this.selectedProductId = null;
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.newProduct = { name: '', description: '', price: 0, isAvailable: true };
  }

  openEditModal(product: Produit) {
    this.newProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      isAvailable: product.isAvailable !== false
    };
    this.selectedProductId = product.trackingId;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedProductId = null;
    this.newProduct = { name: '', description: '', price: 0, isAvailable: true };
  }

  // Toggle rapide disponibilité sans ouvrir le modal
  toggleAvailability(product: Produit, event: Event) {
    event.stopPropagation();
    const selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (!selectedBoutiqueId) return;

    const newStatus = product.isAvailable === false ? true : false;
    this.isTogglingId = product.trackingId;
    const req: ProductRequest = {
      name: product.name,
      description: product.description || '',
      price: Number(product.price) || 0,
      isAvailable: newStatus,
      boutiqueTrackingId: selectedBoutiqueId
    };

    this.merchantService.updateProduct(product.trackingId, req).subscribe({
      next: (res) => {
        product.isAvailable = newStatus;
        this.isTogglingId = null;
        const statusLabel = newStatus ? 'Disponible' : 'Indisponible';
        this.showToast(`"${product.name}" est maintenant ${statusLabel}`, 'success');
      },
      error: (err: any) => {
        this.isTogglingId = null;
        this.showToast(err.error?.message || 'Erreur lors de la mise à jour du statut.', 'danger');
      }
    });
  }

  submitProduct() {
    const selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (!selectedBoutiqueId || !this.newProduct.name) return;

    this.isSubmittingProduct = true;
    const req: ProductRequest = {
      name: this.newProduct.name!,
      description: this.newProduct.description || '',
      price: Number(this.newProduct.price) || 0, // ✅ Forcer la conversion en nombre
      isAvailable: this.newProduct.isAvailable !== false,
      boutiqueTrackingId: selectedBoutiqueId
    };

    if (this.selectedProductId) {
      // Mode édition
      (this.merchantService as any).updateProduct(this.selectedProductId, req).subscribe({
        next: () => {
          this.isSubmittingProduct = false;
          this.closeEditModal();
          this.loadProducts();
          this.showToast('Produit modifié avec succès !', 'success');
        },
        error: (err: any) => {
          this.isSubmittingProduct = false;
          this.showToast(err.error?.message || 'Erreur lors de la modification.', 'danger');
        }
      });
    } else {
      // Mode ajout
      this.merchantService.addProduct(req).subscribe({
        next: () => {
          this.isSubmittingProduct = false;
          this.closeAddModal();
          this.loadProducts();
          this.showToast('Produit créé avec succès !', 'success');
        },
        error: (err: any) => {
          this.isSubmittingProduct = false;
          this.showToast(err.error?.message || 'Erreur lors de la création.', 'danger');
        }
      });
    }
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top',
      cssClass: 'custom-toast',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
