export interface MerchantRequest {
  email: string;
  password?: string;
  lastName: string;
  firstName: string;
  isActive?: boolean;
  phoneNumber: string;
  birthDate?: string;
  businessName: string;
  registrationNumber?: string;
  bankTrackingId?: string;
  accountNumber?: string;
}

export interface MerchantResponse {
  trackingId: string;
  email: string;
  lastName: string;
  firstName: string;
  isActive: boolean;
  phoneNumber: string;
  birthDate?: string;
  businessName: string;
}
