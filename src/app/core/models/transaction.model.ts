export enum TransactionStatut {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  ANNULE = 'ANNULE',
  ECHOUE = 'ECHOUE',
}

export interface TransactionRequest {
  senderTrackingId: string;
  receiverTrackingId: string;
  amount: number;
  transactionPin?: string;
}

export interface TransactionResponse {
  trackingId: string;
  senderTrackingId: string;
  receiverTrackingId: string;
  senderName: string;
  receiverName: string;
  amount: number;
  amountDebited: number;
  amountCredited: number;
  totalCommission: number;
  gnsCommission: number;
  bankCommission: number;
  retrievedByBoutique: boolean;
  deductedFromStudentBourse: boolean;
  status: TransactionStatut;
  createdAt: string;
}
