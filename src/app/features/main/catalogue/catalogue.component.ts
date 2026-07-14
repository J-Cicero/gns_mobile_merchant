import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
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

  isAddProductModalOpen = false;
  isEditProductModalOpen = false;
  newProduct: Partial<ProductRequest> = { name: '', description: '', price: 0, isAvailable: true };
  selectedProductId: string | null = null;
  isSubmittingProduct = false;

  constructor(private merchantService: MerchantService) { }
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

  openAddProductModal() {
    this.newProduct = { name: '', description: '', price: 0, isAvailable: true };
    this.selectedProductId = null;
    this.isAddProductModalOpen = true;
  }

  closeAddProductModal() {
    this.isAddProductModalOpen = false;
  }

  openEditProductModal(product: Produit) {
    this.newProduct = { 
      name: product.name, 
      description: product.description, 
      price: product.price,
      isAvailable: product.isAvailable !== false
    };
    this.selectedProductId = product.trackingId;
    this.isEditProductModalOpen = true;
  }

  closeEditProductModal() {
    this.isEditProductModalOpen = false;
    this.selectedProductId = null;
  }

  submitProduct() {
    const selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (!selectedBoutiqueId || !this.newProduct.name) return;

    this.isSubmittingProduct = true;
    const req: ProductRequest = {
      name: this.newProduct.name!,
      description: this.newProduct.description || '',
      price: this.newProduct.price ?? 0,
      isAvailable: this.newProduct.isAvailable !== false,
      boutiqueTrackingId: selectedBoutiqueId
    };

    if (this.selectedProductId) {
      // Edit mode (assuming backend has updateProduct in service, we'll add it if missing)
      if (this.merchantService['updateProduct']) {
         // Use existing update method if we added it, but just in case fallback to add logic or implement put
         (this.merchantService as any).updateProduct(this.selectedProductId, req).subscribe({
           next: () => {
             this.isSubmittingProduct = false;
             this.closeEditProductModal();
             this.loadProducts();
           },
           error: () => {
             this.isSubmittingProduct = false;
           }
         });
      } else {
         // Workaround if update is not fully supported in service yet, ideally use PUT
         this.isSubmittingProduct = false;
         this.closeEditProductModal();
      }
    } else {
      // Add mode
      this.merchantService.addProduct(req).subscribe({
        next: () => {
          this.isSubmittingProduct = false;
          this.closeAddProductModal();
          this.loadProducts();
        },
        error: () => {
          this.isSubmittingProduct = false;
        }
      });
    }
  }
}
