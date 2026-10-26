import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from './db.js';
import { ensureAvailableSeats, parsePositiveInteger, rowToBooking, rowToRoute } from './domain.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-before-deployment';
if (!process.env.JWT_SECRET) console.warn('JWT_SECRET not set; using an unsafe local-development secret.');

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const routeSchema = z.object({
  from: z.string().trim().min(2).max(80),
  to: z.string().trim().min(2).max(80),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD date format.').refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Departure date is not a valid calendar date.'),
  departureTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Use a valid 24-hour HH:MM time.'),
  price: z.coerce.number().finite().min(1).max(100000),
  seatsAvailable: z.coerce.number().int().min(0).max(60),
  driverName: z.string().trim().min(2).max(120),
  vehicle: z.string().trim().min(2).max(120),
  note: z.string().trim().max(180).optional(),
}).refine((value) => value.from.toLocaleLowerCase() !== value.to.toLocaleLowerCase(), {
  path: ['to'], message: 'Departure and destination must be different.',
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(32).regex(/^$|^\+?\d[\d\s()-]{6,30}$/, 'Phone number format is invalid.').optional().or(z.literal('')),
  password: z.string().min(8).regex(/\d/, 'Password must contain a digit.').regex(/[^A-Za-z0-9]/, 'Password must contain a symbol.'),
  accountType: z.enum(['individual', 'company']),
  role: z.enum(['passenger', 'driver', 'company']).default('passenger'),
  companyName: z.string().trim().max(160).optional(),
}).superRefine((value, ctx) => {
  if (value.accountType === 'company' && !value.companyName?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Company name is required for a company account.' });
  }
});

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });
const bookingSchema = z.object({
  routeId: z.string().trim().min(1),
  seats: z.coerce.number().int().min(1).max(60).default(1),
  guestName: z.string().trim().min(2).max(120).default('სტუმარი'),
});
const routeSelect = db.prepare('SELECT * FROM routes WHERE id = ?');
const selectAllRoutes = db.prepare('SELECT * FROM routes ORDER BY departure_date ASC, departure_time ASC');
const selectUser = db.prepare('SELECT id, full_name, email, phone, role, account_type, company_name, wallet_balance, created_at FROM users WHERE id = ?');

function publicUser(row) {
  return { id: row.id, fullName: row.full_name, email: row.email, phone: row.phone || '', role: row.role, accountType: row.account_type, companyName: row.company_name || undefined, balance: Number(row.wallet_balance || 0), createdAt: row.created_at };
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '8h' });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new HttpError(401, 'Please sign in to continue.'));
  try {
    const claims = jwt.verify(header.slice(7), jwtSecret);
    const row = selectUser.get(claims.sub);
    if (!row) return next(new HttpError(401, 'User session is no longer valid.'));
    req.user = publicUser(row);
    next();
  } catch {
    next(new HttpError(401, 'Authentication token is invalid or expired.'));
  }
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const claims = jwt.verify(header.slice(7), jwtSecret);
    const row = selectUser.get(claims.sub);
    if (row) req.user = publicUser(row);
  } catch { /* Guest booking stays available when no valid session is provided. */ }
  next();
}

function allowRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(new HttpError(403, 'Your account role does not have permission for this action.'));
    next();
  };
}

function canManageRoute(req, route) {
  return req.user?.role === 'admin' || (route.owner_id && route.owner_id === req.user?.id);
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'gza-logistics-api', timestamp: new Date().toISOString() }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const accountType = input.accountType;
    const role = accountType === 'company' ? 'company' : input.role === 'company' ? 'passenger' : input.role;
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      db.prepare(`INSERT INTO users (id, full_name, email, phone, password_hash, account_type, role, company_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, input.fullName.trim(), input.email.toLowerCase(), input.phone || null, passwordHash, accountType, role, accountType === 'company' ? input.companyName?.trim() : null, createdAt);
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) throw new HttpError(409, 'An account with this email already exists.');
      throw error;
    }
    const user = publicUser(selectUser.get(id));
    res.status(201).json({ token: issueToken(user), user });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const row = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(input.email);
    if (!row || !(await bcrypt.compare(input.password, row.password_hash))) throw new HttpError(401, 'Email or password is incorrect.');
    const user = publicUser(row);
    res.json({ token: issueToken(user), user });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', authenticate, (req, res) => res.json({ user: req.user }));
app.post('/api/auth/logout', (_req, res) => res.json({ success: true, message: 'Remove the token from the client to end this session.' }));

app.get('/api/wallet', authenticate, (req, res) => {
  const transactions = db.prepare('SELECT id, type, amount, description, created_at AS createdAt FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(req.user.id);
  const userRow = selectUser.get(req.user.id);
  res.json({ balance: Number(userRow.wallet_balance || 0), currency: 'GEL', transactions });
});

app.post('/api/wallet/topup', authenticate, (req, res, next) => {
  try {
    const { amount } = z.object({ amount: z.coerce.number().finite().min(1).max(5000) }).parse(req.body);
    const transactionId = randomUUID();
    const createdAt = new Date().toISOString();
    const applyTopup = db.transaction(() => {
      db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(amount, req.user.id);
      db.prepare(`INSERT INTO wallet_transactions (id, user_id, type, amount, description, created_at) VALUES (?, ?, 'topup', ?, ?, ?)`).run(transactionId, req.user.id, amount, 'ბალანსის საცდელი შევსება', createdAt);
    });
    applyTopup();
    const user = publicUser(selectUser.get(req.user.id));
    res.status(201).json({ balance: user.balance, transaction: { id: transactionId, type: 'topup', amount, description: 'ბალანსის საცდელი შევსება', createdAt }, simulation: true });
  } catch (error) { next(error); }
});

app.get('/api/routes', (req, res) => {
  const { from, to, date, maxPrice } = req.query;
  let results = selectAllRoutes.all().map(rowToRoute);
  if (typeof from === 'string' && from.trim()) results = results.filter((route) => route.from.toLocaleLowerCase('ka-GE').includes(from.toLocaleLowerCase('ka-GE')));
  if (typeof to === 'string' && to.trim()) results = results.filter((route) => route.to.toLocaleLowerCase('ka-GE').includes(to.toLocaleLowerCase('ka-GE')));
  if (typeof date === 'string' && date) results = results.filter((route) => route.departureDate === date);
  if (typeof maxPrice === 'string' && Number.isFinite(Number(maxPrice))) results = results.filter((route) => route.price <= Number(maxPrice));
  res.json(results);
});

app.get('/api/routes/:id', (req, res, next) => {
  const route = rowToRoute(routeSelect.get(req.params.id));
  if (!route) return next(new HttpError(404, 'Route not found.'));
  res.json(route);
});

app.post('/api/routes', authenticate, allowRoles('driver', 'company', 'admin'), (req, res, next) => {
  try {
    const input = routeSchema.parse(req.body);
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    db.prepare(`INSERT INTO routes (id, from_city, to_city, departure_date, departure_time, price, seats_available, driver_name, vehicle, note, owner_id, created_at)
      VALUES (@id, @from_city, @to_city, @departure_date, @departure_time, @price, @seats_available, @driver_name, @vehicle, @note, @owner_id, @created_at)`)
      .run({ id, from_city: input.from, to_city: input.to, departure_date: input.departureDate, departure_time: input.departureTime, price: input.price, seats_available: input.seatsAvailable, driver_name: input.driverName, vehicle: input.vehicle, note: input.note || null, owner_id: req.user.id, created_at: createdAt });
    res.status(201).json(rowToRoute(routeSelect.get(id)));
  } catch (error) { next(error); }
});

app.put('/api/routes/:id', authenticate, allowRoles('driver', 'company', 'admin'), (req, res, next) => {
  try {
    const existing = routeSelect.get(req.params.id);
    if (!existing) throw new HttpError(404, 'Route not found.');
    if (!canManageRoute(req, existing)) throw new HttpError(403, 'You can only edit routes you manage.');
    const input = routeSchema.parse(req.body);
    db.prepare(`UPDATE routes SET from_city=@from_city, to_city=@to_city, departure_date=@departure_date, departure_time=@departure_time, price=@price, seats_available=@seats_available, driver_name=@driver_name, vehicle=@vehicle, note=@note WHERE id=@id`)
      .run({ id: req.params.id, from_city: input.from, to_city: input.to, departure_date: input.departureDate, departure_time: input.departureTime, price: input.price, seats_available: input.seatsAvailable, driver_name: input.driverName, vehicle: input.vehicle, note: input.note || null });
    res.json(rowToRoute(routeSelect.get(req.params.id)));
  } catch (error) { next(error); }
});

app.delete('/api/routes/:id', authenticate, allowRoles('driver', 'company', 'admin'), (req, res, next) => {
  try {
    const existing = routeSelect.get(req.params.id);
    if (!existing) throw new HttpError(404, 'Route not found.');
    if (!canManageRoute(req, existing)) throw new HttpError(403, 'You can only delete routes you manage.');
    const bookingsCount = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE route_id = ? AND status = 'confirmed'").get(req.params.id).count;
    if (bookingsCount > 0) throw new HttpError(409, 'A route with confirmed bookings cannot be deleted.');
    db.prepare('DELETE FROM routes WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (error) { next(error); }
});

const createBookingTransaction = db.transaction(({ routeId, seats, userId, userRole, guestName }) => {
  const routeRow = routeSelect.get(routeId);
  ensureAvailableSeats(routeRow, seats);
  const price = routeRow.price * seats;
  const bookingId = randomUUID();
  const bookedAt = new Date().toISOString();
  if (userId) {
    const passenger = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(userId);
    if (!passenger || Number(passenger.wallet_balance) < price) throw new HttpError(402, 'Insufficient wallet balance. Please top up your demo wallet first.');
    db.prepare('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ? AND wallet_balance >= ?').run(price, userId, price);
    db.prepare(`INSERT INTO wallet_transactions (id, user_id, type, amount, description, created_at) VALUES (?, ?, 'charge', ?, ?, ?)`).run(randomUUID(), userId, price, `ჯავშანი: ${routeRow.from_city} — ${routeRow.to_city}`, bookedAt);
  }
  // Conditional update plus SQLite transaction is the server-side overbooking guard.
  const update = db.prepare('UPDATE routes SET seats_available = seats_available - ? WHERE id = ? AND seats_available >= ?').run(seats, routeId, seats);
  if (update.changes !== 1) throw new HttpError(409, 'Not enough seats remain for this booking.');
  db.prepare(`INSERT INTO bookings (id, route_id, user_id, guest_name, seats, price, status, booked_at)
    VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)`)
    .run(bookingId, routeId, userId || null, guestName || null, seats, price, bookedAt);
  if (routeRow.owner_id && routeRow.owner_id !== userId) {
    db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(price, routeRow.owner_id);
    db.prepare(`INSERT INTO wallet_transactions (id, user_id, type, amount, description, created_at) VALUES (?, ?, 'earning', ?, ?, ?)`).run(randomUUID(), routeRow.owner_id, price, `რეისის შემოსავალი: ${routeRow.from_city} — ${routeRow.to_city}`, bookedAt);
  }
  const booking = db.prepare(`SELECT b.*, r.from_city, r.to_city, r.departure_date, r.departure_time
    FROM bookings b JOIN routes r ON r.id = b.route_id WHERE b.id = ?`).get(bookingId);
  const balanceRow = userId ? db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(userId) : null;
  return { booking: rowToBooking(booking), route: rowToRoute(routeSelect.get(routeId)), balance: balanceRow ? Number(balanceRow.wallet_balance) : undefined };
});

app.post('/api/bookings', optionalAuth, (req, res, next) => {
  try {
    const input = bookingSchema.parse(req.body ?? {});
    const routeId = input.routeId;
    const seats = parsePositiveInteger(input.seats);
    const guestName = req.user ? undefined : input.guestName;
    const result = createBookingTransaction({ routeId, seats, userId: req.user?.id, userRole: req.user?.role, guestName });
    res.status(201).json(result);
  } catch (error) { next(error); }
});

app.get('/api/bookings/mine', authenticate, (req, res) => {
  const rows = db.prepare(`SELECT b.*, r.from_city, r.to_city, r.departure_date, r.departure_time
    FROM bookings b JOIN routes r ON r.id = b.route_id WHERE b.user_id = ? ORDER BY b.booked_at DESC`).all(req.user.id);
  res.json(rows.map(rowToBooking));
});

app.get('/api/dashboard/stats', authenticate, allowRoles('driver', 'company', 'admin'), (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const routeStatsQuery = isAdmin
    ? db.prepare('SELECT COUNT(*) AS routeCount, COALESCE(SUM(CASE WHEN seats_available > 0 THEN 1 ELSE 0 END), 0) AS availableRouteCount, COALESCE(SUM(seats_available),0) AS openSeats FROM routes').get()
    : db.prepare('SELECT COUNT(*) AS routeCount, COALESCE(SUM(CASE WHEN seats_available > 0 THEN 1 ELSE 0 END), 0) AS availableRouteCount, COALESCE(SUM(seats_available),0) AS openSeats FROM routes WHERE owner_id = ?').get(req.user.id);
  const bookingCount = isAdmin
    ? db.prepare('SELECT COUNT(*) AS count FROM bookings').get().count
    : db.prepare('SELECT COUNT(*) AS count FROM bookings b JOIN routes r ON r.id = b.route_id WHERE r.owner_id = ?').get(req.user.id).count;
  res.json({ ...routeStatsQuery, bookingCount });
});

app.use((err, _req, res, _next) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed.', details: err.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
  const status = Number(err.status) || 500;
  if (status >= 500) console.error('API request failed:', err);
  res.status(status).json({ error: status >= 500 ? 'Internal server error.' : err.message || 'Request failed.' });
});

app.listen(port, () => console.log(`Gza Logistics API listening on http://localhost:${port}/api`));
