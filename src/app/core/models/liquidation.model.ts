export interface LiquidationRequest {
  boutiqueTrackingId: string;
  amountToLiquidate: number; // BigDecimal from backend -> number
}

export interface LiquidationResponse {
  trackingId: string;
  boutiqueTrackingId: string;
  boutiqueName: string;
  amountToLiquidate: number; // BigDecimal from backend -> number
  createdAt: string; // LocalDateTime from backend -> string
  validatedAt?: string; // LocalDateTime from backend -> string
  status: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
  transferReference?: string;
}
