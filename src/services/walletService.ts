import { apiRequest } from './apiClient';

export type WalletTransactionType = 'topup' | 'charge' | 'earning';
export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  createdAt: string;
}
export interface WalletSnapshot {
  balance: number;
  currency: 'GEL';
  transactions: WalletTransaction[];
}
export interface TopupResponse {
  balance: number;
  transaction: WalletTransaction;
  simulation: true;
}

export function getWallet() {
  return apiRequest<WalletSnapshot>('/wallet');
}

export function topupWallet(amount: number) {
  return apiRequest<TopupResponse>('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) });
}
