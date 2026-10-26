import { randomUUID } from 'node:crypto';
import { db } from '../server/db.js';

const baseUrl = (process.env.API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const suffix = randomUUID();
const email = `gza-smoke-${suffix}@example.com`;
let userId;
let routeId;
let token;

async function request(path, { token, method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  return { response, data };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const health = await request('/health');
  assert(health.response.ok && health.data.status === 'ok', 'API health check failed. Is the server running on port 4000?');
  console.log('PASS GET /api/health');

  const registered = await request('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'QA Smoke Test',
      email,
      phone: '',
      password: 'SmokePass!2026',
      accountType: 'individual',
      role: 'driver',
    },
  });
  assert(registered.response.status === 201, `Registration failed (${registered.response.status}).`);
  token = registered.data.token;
  userId = registered.data.user?.id;
  assert(token && userId, 'Registration response did not include token and user ID.');
  console.log('PASS POST /api/auth/register (JWT issued)');

  const loggedIn = await request('/auth/login', { method: 'POST', body: { email, password: 'SmokePass!2026' } });
  assert(loggedIn.response.ok && loggedIn.data.token, `Login failed (${loggedIn.response.status}).`);
  token = loggedIn.data.token;
  console.log('PASS POST /api/auth/login (password hash verified)');

  const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const created = await request('/routes', {
    method: 'POST',
    token,
    body: {
      from: `QA City ${suffix.slice(0, 4)}`,
      to: `QA Port ${suffix.slice(4, 8)}`,
      departureDate: futureDate,
      departureTime: '09:15',
      price: 1,
      seatsAvailable: 1,
      driverName: 'QA Smoke Test',
      vehicle: 'Test Minibus',
      note: 'Temporary route created by API smoke test.',
    },
  });
  assert(created.response.status === 201, `Route creation failed (${created.response.status}): ${JSON.stringify(created.data)}`);
  routeId = created.data.id;
  assert(routeId, 'Route creation response did not include an ID.');
  console.log('PASS POST /api/routes (authenticated driver)');

  const booked = await request('/bookings', {
    method: 'POST',
    body: { routeId, seats: 1, guestName: 'QA Smoke Guest' },
  });
  assert(booked.response.status === 201, `A valid booking should succeed (${booked.response.status}): ${JSON.stringify(booked.data)}`);
  assert(booked.data.route?.seatsAvailable === 0, 'A successful booking did not decrement the final seat.');
  console.log('PASS POST /api/bookings (valid booking consumes the final seat)');

  const overbook = await request('/bookings', {
    method: 'POST',
    body: { routeId, seats: 1, guestName: 'QA Smoke Guest Two' },
  });
  assert(overbook.response.status === 409, `Overbooking should return HTTP 409, received ${overbook.response.status}.`);
  console.log('PASS POST /api/bookings (second booking rejected with HTTP 409)');

  const route = await request(`/routes/${encodeURIComponent(routeId)}`);
  assert(route.response.ok && route.data.seatsAvailable === 0, 'Rejected overbooking changed the available seat count.');
  console.log('PASS GET /api/routes/:id (seat count remains zero after rejected booking)');
  console.log('\nAPI smoke test passed. Temporary route and account will be cleaned up.');
} catch (error) {
  console.error('\nAPI smoke test failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  // Clean only the temporary smoke-test records, even if a regression unexpectedly creates a booking.
  try {
    if (routeId) {
      db.prepare('DELETE FROM bookings WHERE route_id = ?').run(routeId);
      db.prepare('DELETE FROM routes WHERE id = ?').run(routeId);
    }
    if (userId) {
      db.prepare('DELETE FROM wallet_transactions WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    }
  } catch (cleanupError) {
    process.exitCode = 1;
    console.error('Smoke-test cleanup failed:', cleanupError instanceof Error ? cleanupError.message : cleanupError);
  } finally {
    if (db.open) db.close();
  }
}
