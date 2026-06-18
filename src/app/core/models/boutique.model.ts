export interface Boutique {
  trackingId: string;
  name: string;
  description: string;
  latitude?: number;
  longitude?: number;
  kycStatus: string;
  merchantTrackingId: string;
  walletTrackingId?: string;
  balance?: number;
  limitAmount?: number;
}

export interface Produit {
  trackingId: string;
  name: string;
  description: string;
  price: number;
  boutiqueTrackingId: string;
  stock: number;
  isAvailable: boolean;
  addedAt?: string;
}
