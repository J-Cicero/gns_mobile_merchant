export enum TransactionStatut {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  ANNULE = 'ANNULE',
  ECHOUE = 'ECHOUE',
}

export interface TransactionRequest {
  senderTrackingId: string;
  receiverTrackingId: string;
  amount: number; // BigDecimal from backend -> number
  transactionPin?: string; // String from backend
  isCommissionPaid?: boolean; // Boolean from backend
  isRetry?: boolean; // Boolean from backend
}

export interface TransactionResponse {
  trackingId: string;
  senderTrackingId: string;
  receiverTrackingId: string;
  senderName: string;
  receiverName: string;
  amount: number; // BigDecimal from backend -> number
  amountDebited: number; // BigDecimal from backend -> number
  amountCredited: number; // BigDecimal from backend -> number
  totalCommission: number; // BigDecimal from backend -> number
  gnsCommission: number; // BigDecimal from backend -> number
  bankCommission: number; // BigDecimal from backend -> number
  isCommissionPaid: boolean;
  isRetry: boolean;
  status: TransactionStatut;
  createdAt: string; // LocalDateTime from backend -> string
}
