import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookingRecord, DataSource, RouteFormValues, TransportRoute } from '../types';
import {
  createBookingRequest, createRouteRequest, deleteRouteRequest, getBookings, getBookingsLocally,
  getRoutes, saveBookingsLocally, saveRoutesLocally, updateRouteRequest,
} from '../services/routesService';
import { createId } from '../utils/format';
import { useAuthStore } from './useAuthStore';

interface PlatformState {
  routes: TransportRoute[];
  bookings: BookingRecord[];
  loading: boolean;
  initialized: boolean;
  dataSource: DataSource;
  sourceMessage: string;
  initialize: () => Promise<void>;
  saveRoute: (id: string | null, values: RouteFormValues) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  bookRoute: (id: string, guestName?: string, seats?: number) => Promise<void>;
  replaceRoutes: (routes: TransportRoute[], source?: DataSource, message?: string) => void;
}

function localBooking(route: TransportRoute, guestName: string, seats: number): BookingRecord {
  return {
    id: createId(), routeId: route.id, from: route.from, to: route.to,
    departureDate: route.departureDate, departureTime: route.departureTime,
    price: route.price * seats, seats, guestName, bookedAt: new Date().toISOString(), status: 'confirmed',
  };
}

export const usePlatformStore = create<PlatformState>()(persist(
  (set, get) => ({
    routes: [],
    bookings: [],
    loading: false,
    initialized: false,
    dataSource: 'demo',
    sourceMessage: 'მონაცემები ჯერ არ ჩატვირთულა.',

    initialize: async () => {
      if (get().initialized || get().loading) return;
      set({ loading: true });
      const timingLabel = `platform-initialize-${Date.now()}`;
      console.time(timingLabel);
      try {
        const [routeResult, bookings] = await Promise.all([getRoutes(), getBookings()]);
        console.table(routeResult.routes.map(({ from, to, departureDate, seatsAvailable, price }) => ({ from, to, departureDate, seatsAvailable, price })));
        saveRoutesLocally(routeResult.routes);
        saveBookingsLocally(bookings);
        set({
          routes: routeResult.routes,
          bookings,
          dataSource: routeResult.source,
          sourceMessage: routeResult.message ?? '',
          initialized: true,
        });
      } catch (error) {
        const localRoutes = get().routes;
        const localBookings = getBookingsLocally();
        set({
          routes: localRoutes,
          bookings: localBookings,
          dataSource: localRoutes.length ? 'cache' : 'demo',
          sourceMessage: error instanceof Error ? `API ვერ ჩაიტვირთა. გამოიყენება შენახული დემო მონაცემები. ${error.message}` : 'API ვერ ჩაიტვირთა. გამოიყენება შენახული დემო მონაცემები.',
          initialized: true,
        });
      } finally {
        console.timeEnd(timingLabel);
        set({ loading: false });
      }
    },

    saveRoute: async (id, values) => {
      const current = get().routes;
      let nextRoute: TransportRoute;
      if (id) {
        const remoteRoute = await updateRouteRequest(id, values);
        const existing = current.find((route) => route.id === id);
        if (!existing) throw new Error('მარშრუტი ვეღარ მოიძებნა. განაახლე სია.');
        nextRoute = remoteRoute ?? { ...existing, ...values };
        const routes = current.map((route) => route.id === id ? nextRoute : route);
        saveRoutesLocally(routes);
        set({ routes, dataSource: remoteRoute ? 'api' : get().dataSource, sourceMessage: remoteRoute ? '' : 'API მიუწვდომელია. ცვლილება შენახულია ამ ბრაუზერის დემო მონაცემებში.' });
      } else {
        const remoteRoute = await createRouteRequest(values);
        nextRoute = remoteRoute ?? { ...values, id: createId(), createdAt: new Date().toISOString(), ownerId: useAuthStore.getState().user?.id };
        const routes = [nextRoute, ...current];
        saveRoutesLocally(routes);
        set({ routes, dataSource: remoteRoute ? 'api' : get().dataSource, sourceMessage: remoteRoute ? '' : 'API მიუწვდომელია. ცვლილება შენახულია ამ ბრაუზერის დემო მონაცემებში.' });
      }
    },

    deleteRoute: async (id) => {
      const isRemoteDelete = await deleteRouteRequest(id);
      const routes = get().routes.filter((route) => route.id !== id);
      saveRoutesLocally(routes);
      set({ routes, sourceMessage: isRemoteDelete ? '' : 'API მიუწვდომელია. წაშლა მოქმედებს მხოლოდ ლოკალურ დემო მონაცემებზე.' });
    },

    bookRoute: async (id, guestName = 'სტუმარი', seats = 1) => {
      const route = get().routes.find((item) => item.id === id);
      if (!route) throw new Error('მარშრუტი ვერ მოიძებნა.');
      if (!Number.isInteger(seats) || seats < 1 || seats > 60) throw new Error('ადგილების რაოდენობა უნდა იყოს 1-დან 60-მდე მთელი რიცხვი.');
      if (route.seatsAvailable < seats) throw new Error('მითითებული რაოდენობისთვის თავისუფალი ადგილები აღარ არის.');

      const remoteResult = await createBookingRequest(route, guestName, seats);
      if (remoteResult) {
        const routes = get().routes.map((item) => item.id === id ? remoteResult.route : item);
        const bookings = [remoteResult.booking, ...get().bookings.filter((item) => item.id !== remoteResult.booking.id)];
        saveRoutesLocally(routes);
        saveBookingsLocally(bookings);
        set({ routes, bookings, dataSource: 'api', sourceMessage: '' });
        if (typeof remoteResult.balance === 'number') useAuthStore.getState().updateBalance(remoteResult.balance);
        return;
      }

      const current = get().routes.find((item) => item.id === id);
      if (!current || current.seatsAvailable < seats) throw new Error('მითითებული ადგილები უკვე აღარ არის ხელმისაწვდომი. განაახლე მარშრუტების სია.');
      const routes = get().routes.map((item) => item.id === id ? { ...item, seatsAvailable: item.seatsAvailable - seats } : item);
      const booking = localBooking(current, guestName, seats);
      const bookings = [booking, ...get().bookings];
      saveRoutesLocally(routes);
      saveBookingsLocally(bookings);
      set({ routes, bookings, sourceMessage: 'API მიუწვდომელია. ჯავშანი შეინახა ლოკალურმა დემო რეჟიმმა.' });
    },

    replaceRoutes: (routes, source = 'api', message = '') => {
      saveRoutesLocally(routes);
      set({ routes, dataSource: source, sourceMessage: message, initialized: true });
    },
  }),
  {
    name: 'gza.platform.store.v1',
    partialize: (state) => ({ routes: state.routes, bookings: state.bookings }) as PlatformState,
  },
));
