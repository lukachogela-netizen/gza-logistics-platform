import type { User } from '../types';
import { apiRequest } from './apiClient';

export type AuthUser = User;

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  accountType: 'individual' | 'company';
  role: 'passenger' | 'driver';
  companyName?: string;
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function registerRequest(values: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(values) });
}
