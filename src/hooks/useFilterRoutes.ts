import { useMemo } from 'react';
import type { TransportRoute } from '../types';
import { useDebounce } from './useDebounce';

export type AvailabilityFilter = 'all' | 'available' | 'full';

export interface RouteFilters {
  from: string;
  to: string;
  date: string;
  maxPrice: string;
}

/** Keeps debouncing and the route filtering rules out of the page rendering component. */
export function useFilterRoutes(
  routes: TransportRoute[],
  query: string,
  availability: AvailabilityFilter,
  filters: RouteFilters,
) {
  const debouncedQuery = useDebounce(query, 350);
  const filteredRoutes = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase('ka-GE');
    const normalizedFrom = filters.from.trim().toLocaleLowerCase('ka-GE');
    const normalizedTo = filters.to.trim().toLocaleLowerCase('ka-GE');
    const maxPrice = filters.maxPrice.trim() ? Number(filters.maxPrice) : null;

    return routes.filter((route) => {
      const matchesQuery = !normalizedQuery ||
        [route.from, route.to, route.driverName, route.vehicle].some((value) =>
          value.toLocaleLowerCase('ka-GE').includes(normalizedQuery),
        );
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available' ? route.seatsAvailable > 0 : route.seatsAvailable <= 0);
      const matchesFrom = !normalizedFrom || route.from.toLocaleLowerCase('ka-GE').includes(normalizedFrom);
      const matchesTo = !normalizedTo || route.to.toLocaleLowerCase('ka-GE').includes(normalizedTo);
      const matchesDate = !filters.date || route.departureDate === filters.date;
      const matchesPrice = maxPrice === null || !Number.isFinite(maxPrice) || maxPrice <= 0 || route.price <= maxPrice;
      return matchesQuery && matchesAvailability && matchesFrom && matchesTo && matchesDate && matchesPrice;
    });
  }, [routes, debouncedQuery, availability, filters.from, filters.to, filters.date, filters.maxPrice]);

  return { filteredRoutes, debouncedQuery };
}
