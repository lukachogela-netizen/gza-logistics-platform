import 'dotenv/config';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configuredPath = process.env.DATABASE_FILE || './server/data/gza.sqlite';
const databasePath = resolve(projectRoot, configuredPath);
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'company')),
    role TEXT NOT NULL CHECK (role IN ('passenger', 'driver', 'company', 'admin')),
    company_name TEXT,
    wallet_balance REAL NOT NULL DEFAULT 0 CHECK (wallet_balance >= 0),
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    price REAL NOT NULL CHECK (price > 0),
    seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
    driver_name TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    note TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_routes_date ON routes(departure_date);
  CREATE INDEX IF NOT EXISTS idx_routes_cities ON routes(from_city, to_city);
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    guest_name TEXT,
    seats INTEGER NOT NULL CHECK (seats > 0),
    price REAL NOT NULL CHECK (price > 0),
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
    booked_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id, booked_at);
  CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('topup', 'charge', 'earning')),
    amount REAL NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_id, created_at);
`);

// Lightweight migration for local databases created before wallet support.
const userColumns = db.prepare('PRAGMA table_info(users)').all();
if (!userColumns.some((column) => column.name === 'wallet_balance')) {
  db.exec('ALTER TABLE users ADD COLUMN wallet_balance REAL NOT NULL DEFAULT 0 CHECK (wallet_balance >= 0)');
}

function localDateAfterDays(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const routeCount = db.prepare('SELECT COUNT(*) AS count FROM routes').get().count;
if (routeCount === 0) {
  const insertRoute = db.prepare(`
    INSERT INTO routes (id, from_city, to_city, departure_date, departure_time, price, seats_available, driver_name, vehicle, note, owner_id, created_at)
    VALUES (@id, @from_city, @to_city, @departure_date, @departure_time, @price, @seats_available, @driver_name, @vehicle, @note, NULL, @created_at)
  `);
  const now = new Date().toISOString();
  const samples = [
    ['route-001', 'თბილისი', 'ბათუმი', localDateAfterDays(2), '09:00', 35, 4, 'გიორგი მაისურაძე', 'Mercedes-Benz Sprinter', 'გზაში ერთი მოკლე გაჩერება იქნება.'],
    ['route-002', 'თბილისი', 'ქუთაისი', localDateAfterDays(3), '08:30', 25, 7, 'ნიკა ბერიძე', 'Ford Transit', 'ბარგის ერთი საშუალო ჩანთა შედის ფასში.'],
    ['route-003', 'ქუთაისი', 'თბილისი', localDateAfterDays(4), '14:00', 28, 3, 'ანა ქავთარაძე', 'Volkswagen Crafter', 'გამგზავრება ცენტრალური სადგურიდან.'],
    ['route-004', 'თბილისი', 'გორი', localDateAfterDays(5), '11:15', 15, 0, 'დავით კაპანაძე', 'Toyota Hiace', 'ამ რეისზე ადგილები აღარ არის.'],
    ['route-005', 'ბათუმი', 'თბილისი', localDateAfterDays(6), '07:45', 38, 5, 'ლევან კობახიძე', 'Mercedes-Benz Vito', 'შესაძლებელია მცირე ამანათის წამოღება.'],
    ['route-006', 'რუსთავი', 'თბილისი', localDateAfterDays(7), '18:00', 10, 8, 'საბა ნოზაძე', 'Ford Transit Custom', 'საღამოს რეისი.'],
  ];
  const seed = db.transaction(() => {
    for (const [id, from_city, to_city, departure_date, departure_time, price, seats_available, driver_name, vehicle, note] of samples) {
      insertRoute.run({ id, from_city, to_city, departure_date, departure_time, price, seats_available, driver_name, vehicle, note, created_at: now });
    }
  });
  seed();
}


// Refresh only the built-in demo routes if their departure date has passed.
// User-created routes have non-null owner_id and are never modified here.
const refreshDemoRoute = db.prepare(`
  UPDATE routes SET departure_date = ?
  WHERE id = ? AND owner_id IS NULL AND departure_date < ?
`);
const demoRouteOffsets = [
  ['route-001', 2], ['route-002', 3], ['route-003', 4],
  ['route-004', 5], ['route-005', 6], ['route-006', 7],
];
const today = localDateAfterDays(0);
const refreshDemoRoutes = db.transaction(() => {
  for (const [id, offset] of demoRouteOffsets) {
    refreshDemoRoute.run(localDateAfterDays(offset), id, today);
  }
});
refreshDemoRoutes();
