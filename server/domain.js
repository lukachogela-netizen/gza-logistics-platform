export function parsePositiveInteger(value, label = 'seats') {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 60) {
    const error = new Error(`${label} must be an integer between 1 and 60.`);
    error.status = 400;
    throw error;
  }
  return number;
}

export function ensureAvailableSeats(route, requestedSeats) {
  if (!route) {
    const error = new Error('Route not found.');
    error.status = 404;
    throw error;
  }
  if (route.seats_available < requestedSeats) {
    const error = new Error('Not enough seats are available for this route.');
    error.status = 409;
    throw error;
  }
}

export function rowToRoute(row) {
  if (!row) return null;
  return {
    id: row.id,
    from: row.from_city,
    to: row.to_city,
    departureDate: row.departure_date,
    departureTime: row.departure_time,
    price: row.price,
    seatsAvailable: row.seats_available,
    driverName: row.driver_name,
    vehicle: row.vehicle,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    ownerId: row.owner_id ?? undefined,
  };
}

export function rowToBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    routeId: row.route_id,
    from: row.from_city,
    to: row.to_city,
    departureDate: row.departure_date,
    departureTime: row.departure_time,
    price: row.price,
    seats: row.seats,
    bookedAt: row.booked_at,
    status: row.status,
    guestName: row.guest_name ?? undefined,
  };
}
