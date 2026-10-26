import type { BookingRecord, RouteFormValues, RoutesResult, TransportRoute } from '../types';
import { apiRequest, isRecoverableApiFailure } from './apiClient';

const ROUTES_STORAGE_KEY = 'gza.routes.v1';
const BOOKINGS_STORAGE_KEY = 'gza.bookings.v1';

function dateAfterDays(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const demoRoutes: TransportRoute[] = [
  { id: 'route-001', from: 'თბილისი', to: 'ბათუმი', departureDate: dateAfterDays(2), departureTime: '09:00', price: 35, seatsAvailable: 4, driverName: 'გიორგი მაისურაძე', vehicle: 'Mercedes-Benz Sprinter', note: 'გზაში ერთი მოკლე გაჩერება იქნება.', createdAt: '2026-10-10T09:00:00.000Z' },
  { id: 'route-002', from: 'თბილისი', to: 'ქუთაისი', departureDate: dateAfterDays(3), departureTime: '08:30', price: 25, seatsAvailable: 7, driverName: 'ნიკა ბერიძე', vehicle: 'Ford Transit', note: 'ბარგის ერთი საშუალო ჩანთა შედის ფასში.', createdAt: '2026-10-11T11:30:00.000Z' },
  { id: 'route-003', from: 'ქუთაისი', to: 'თბილისი', departureDate: dateAfterDays(4), departureTime: '14:00', price: 28, seatsAvailable: 3, driverName: 'ანა ქავთარაძე', vehicle: 'Volkswagen Crafter', note: 'გამგზავრება ცენტრალური სადგურიდან.', createdAt: '2026-10-11T12:00:00.000Z' },
  { id: 'route-004', from: 'თბილისი', to: 'გორი', departureDate: dateAfterDays(5), departureTime: '11:15', price: 15, seatsAvailable: 0, driverName: 'დავით კაპანაძე', vehicle: 'Toyota Hiace', note: 'ამ რეისზე ადგილები აღარ არის.', createdAt: '2026-10-12T10:00:00.000Z' },
  { id: 'route-005', from: 'ბათუმი', to: 'თბილისი', departureDate: dateAfterDays(6), departureTime: '07:45', price: 38, seatsAvailable: 5, driverName: 'ლევან კობახიძე', vehicle: 'Mercedes-Benz Vito', note: 'შესაძლებელია მცირე ამანათის წამოღება.', createdAt: '2026-10-12T14:15:00.000Z' },
  { id: 'route-006', from: 'რუსთავი', to: 'თბილისი', departureDate: dateAfterDays(7), departureTime: '18:00', price: 10, seatsAvailable: 8, driverName: 'საბა ნოზაძე', vehicle: 'Ford Transit Custom', note: 'საღამოს რეისი.', createdAt: '2026-10-13T08:00:00.000Z' },
];

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function cachedRoutes(): TransportRoute[] | null {
  try {
    const parsed = safeParse<unknown>(localStorage.getItem(ROUTES_STORAGE_KEY));
    return Array.isArray(parsed) ? parsed as TransportRoute[] : null;
  } catch { return null; }
}

export function saveRoutesLocally(routes: TransportRoute[]): void {
  try { localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes)); } catch { /* Storage may be disabled. */ }
}

export function getBookingsLocally(): BookingRecord[] {
  try {
    const parsed = safeParse<unknown>(localStorage.getItem(BOOKINGS_STORAGE_KEY));
    return Array.isArray(parsed) ? parsed as BookingRecord[] : [];
  } catch { return []; }
}

export function saveBookingsLocally(bookings: BookingRecord[]): void {
  try { localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings)); } catch { /* Storage may be disabled. */ }
}

export async function getRoutes(): Promise<RoutesResult> {
  try {
    const routes = await apiRequest<TransportRoute[]>('/routes');
    saveRoutesLocally(routes);
    return { routes, source: 'api' };
  } catch (error) {
    if (!isRecoverableApiFailure(error)) throw error;
    const cached = cachedRoutes();
    return {
      routes: cached ?? demoRoutes,
      source: cached ? 'cache' : 'demo',
      message: 'API მიუწვდომელია. ნაჩვენებია ლოკალური დემო მონაცემები.',
    };
  }
}

export async function getRouteById(id: string): Promise<TransportRoute | null> {
  try {
    return await apiRequest<TransportRoute>(`/routes/${encodeURIComponent(id)}`);
  } catch (error) {
    if (!isRecoverableApiFailure(error)) throw error;
    const cached = cachedRoutes() ?? demoRoutes;
    return cached.find((route) => route.id === id) ?? null;
  }
}

export async function getBookings(): Promise<BookingRecord[]> {
  try {
    const bookings = await apiRequest<BookingRecord[]>('/bookings/mine');
    saveBookingsLocally(bookings);
    return bookings;
  } catch (error) {
    if (!isRecoverableApiFailure(error)) return getBookingsLocally();
    return getBookingsLocally();
  }
}

export async function createRouteRequest(values: RouteFormValues): Promise<TransportRoute | null> {
  try { return await apiRequest<TransportRoute>('/routes', { method: 'POST', body: JSON.stringify(values) }); }
  catch (error) { if (isRecoverableApiFailure(error)) return null; throw error; }
}

export async function updateRouteRequest(id: string, values: RouteFormValues): Promise<TransportRoute | null> {
  try { return await apiRequest<TransportRoute>(`/routes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(values) }); }
  catch (error) { if (isRecoverableApiFailure(error)) return null; throw error; }
}

export async function deleteRouteRequest(id: string): Promise<boolean> {
  try { await apiRequest<{ success: boolean }>(`/routes/${encodeURIComponent(id)}`, { method: 'DELETE' }); return true; }
  catch (error) { if (isRecoverableApiFailure(error)) return false; throw error; }
}

export async function createBookingRequest(route: TransportRoute, guestName = 'სტუმარი', seats = 1): Promise<{ booking: BookingRecord; route: TransportRoute; balance?: number } | null> {
  try {
    return await apiRequest<{ booking: BookingRecord; route: TransportRoute; balance?: number }>('/bookings', {
      method: 'POST', body: JSON.stringify({ routeId: route.id, seats, guestName }),
    });
  } catch (error) { if (isRecoverableApiFailure(error)) return null; throw error; }
}

export function demoRoutesFallback(): TransportRoute[] { return demoRoutes; }
