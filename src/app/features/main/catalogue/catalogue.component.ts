import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { MerchantService } from '../../../core/services/merchant.service';
import { Produit } from '../../../core/models/boutique.model';
import { ProductRequest } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CatalogueComponent implements OnInit, ViewWillEnter {

  produits: Produit[] = [];
  isLoading = false;
  errorMessage = '';

  isAddProductModalOpen = false;
  newProduct: Partial<ProductRequest> = { name: '', description: '', price: 0, stock: 100 };
  isSubmittingProduct = false;

  constructor(private merchantService: MerchantService) { }

  ngOnInit() {}

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
    this.newProduct = { name: '', description: '', price: 0, stock: 100 };
    this.isAddProductModalOpen = true;
  }

  closeAddProductModal() {
    this.isAddProductModalOpen = false;
  }

  submitNewProduct() {
    const selectedBoutiqueId = this.merchantService.getSelectedBoutiqueId();
    if (!selectedBoutiqueId || !this.newProduct.name || !this.newProduct.price) return;

    this.isSubmittingProduct = true;
    const req: ProductRequest = {
      name: this.newProduct.name,
      description: this.newProduct.description || '',
      price: this.newProduct.price,
      stock: this.newProduct.stock || 0,
      boutiqueTrackingId: selectedBoutiqueId
    };

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
