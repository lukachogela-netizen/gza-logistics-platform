export type AccountType = 'individual' | 'company';
export type RouteStatus = 'available' | 'full';
export type DataSource = 'api' | 'cache' | 'demo';
export type UserRole = 'passenger' | 'driver' | 'company' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountType: AccountType;
  companyName?: string;
  balance?: number;
  createdAt: string;
}

export interface TransportRoute {
  id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  price: number;
  seatsAvailable: number;
  driverName: string;
  vehicle: string;
  note?: string;
  createdAt: string;
  ownerId?: string;
}

export interface BookingRecord {
  id: string;
  routeId: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  price: number;
  seats?: number;
  guestName?: string;
  bookedAt: string;
  status: 'confirmed' | 'cancelled';
}

export interface RouteFormValues {
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  price: number;
  seatsAvailable: number;
  driverName: string;
  vehicle: string;
  note?: string;
}

export interface RouteAction {
  type: 'book' | 'edit' | 'delete';
  routeId: string;
}

export interface RoutesResult {
  routes: TransportRoute[];
  source: DataSource;
  message?: string;
}
