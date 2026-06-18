export interface ProductRequest {
  boutiqueTrackingId: string;
  name: string;
  description: string;
  price: number; // BigDecimal from backend -> number
  stock: number;
  isAvailable: boolean;
  addedAt?: string; // LocalDateTime from backend -> string
}

export interface ProductResponse {
  trackingId: string;
  boutiqueTrackingId: string;
  name: string;
  description: string;
  price: number; // BigDecimal from backend -> number
  stock: number;
  isAvailable: boolean;
  addedAt: string; // LocalDateTime from backend -> string
}
