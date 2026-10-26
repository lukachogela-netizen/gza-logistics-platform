# გზა — ტექნიკური დავალება და არქიტექტურა

## 1. პროექტის მიზანი და ბიზნეს-ლოგიკა

„გზა“ არის მარშრუტების ძიებისა და დაჯავშნის პლატფორმა, რომელიც ერთმანეთთან აკავშირებს მგზავრებს, მძღოლებს/გადამზიდებსა და კომპანიებს. მომხმარებელი ეძებს მარშრუტს მიმართულების, თარიღის, ფასისა და თავისუფალი ადგილების მიხედვით; მძღოლი ან კომპანია ქმნის და მართავს რეისებს; ჯავშნის შექმნისას სერვერი ამოწმებს დარჩენილ ადგილებს და ტრანზაქციულად ამცირებს რაოდენობას.

### როლები

- **Passenger (ფიზიკური პირი/მგზავრი):** საჯარო მარშრუტების ძიება, ჯავშნის შექმნა, საკუთარი ჯავშნების ნახვა.
- **Driver (მძღოლი/გადამზიდი):** ავტორიზაციის შემდეგ საკუთარი მარშრუტების შექმნა/რედაქტირება/წაშლა; ფასისა და ადგილების კონტროლი.
- **Company (იურიდიული პირი):** კომპანიის პროფილით რეგისტრაცია, კომპანიის მიერ შექმნილი რეისების მართვა; გაფართოებულ ვერსიაში მძღოლებისა და ბიუჯეტის კოორდინაცია.
- **Admin (ადმინისტრატორი):** ტექნიკური როლი, რომელიც ამ პროექტში API როლების კონტროლისთვისაა გათვალისწინებული; საჯარო რეგისტრაციით არ იქმნება.
- **Guest (სტუმარი):** შეუძლია მარშრუტების ნახვა და დემო/სტუმრის ჯავშნის შექმნა, მაგრამ დაცული მართვის API-ები მოითხოვს შესაბამის როლს.

რეგისტრაციისას აირჩევა `accountType: individual | company`; `individual` ანგარიშისთვის შესაძლებელია passenger ან driver როლი, ხოლო company ტიპი იღებს company როლს.

## 2. ფუნქციონალური მოთხოვნები

1. მარშრუტების საჯარო სიის ჩვენება: მიმართულება, დრო/თარიღი, ფასი, მძღოლი/მანქანა და თავისუფალი ადგილები.
2. მიმართულების, მძღოლისა და სატრანსპორტო საშუალების მიხედვით ძიება (350ms Debounce), ასევე ხელმისაწვდომობის ფილტრი.
3. მარშრუტის დამატება/რედაქტირება Portal მოდალური ფორმით; წაშლა დადასტურების შემდეგ.
4. ინტერაქტიული Leaflet/OpenStreetMap რუკა აჩვენებს მარშრუტების ქალაქებსა და ხაზებს; tile-ის ინტერნეტზე დამოკიდებულება დოკუმენტირებულია.
4. რეგისტრაცია და შესვლა: full name, unique email, optional phone, password policy, account type და საჭიროებისას company name.
5. დაცული API ოპერაციები JWT და RBAC middleware-ით; მარშრუტის მფლობელობის შემოწმება.
6. ჯავშნის შექმნა; API ამოწმებს თავისუფალ ადგილებს სერვერზე და SQLite ტრანზაქციაში აკლებს ადგილებს. თუ ადგილები აღარ არის, აბრუნებს `409 Conflict`.
7. Header-ის ჯავშნების მრიცხველი, მარშრუტების სია და ჯავშნების გვერდი კითხულობს ერთ Zustand Store-ს.
8. ავტორიზებულ ანგარიშებს აქვთ სატესტო საფულე: top-up ledger, ჯავშნისას ბალანსის ჩამოჭრა და route owner earning; ეს მხოლოდ ფინანსური სიმულაციაა.
8. API-ის ქსელური შეცდომის ან 5xx პასუხისას UI იყენებს cache/demo მონაცემებს და აჩვენებს შესაბამის ბანერს.
9. Error Boundary აჩვენებს Fallback UI-სა და Retry ღილაკს მოულოდნელი React render error-ისას.

## 3. არაფუნქციონალური მოთხოვნები

- **Responsive:** Mobile-first განლაგება; 375px-ზე ერთი სვეტი, ტაბლეტზე ორი და desktop-ზე სამი/ოთხი ბარათი.
- **Accessibility:** სემანტიკური HTML5, label/aria, keyboard navigation, `:focus-visible`, modal focus management და `prefers-reduced-motion`.
- **Performance:** debounce, `useMemo`, `useCallback`, `React.memo`, route-level `React.lazy`/`Suspense`; CSS hover/loader ეფექტებისთვის ძირითადად `transform`/`opacity`.
- **Maintainability:** `components/`, `hooks/`, `services/`, `store/`, `types/`, `utils/` ფენები; SRP/DRY; ESLint/Prettier.
- **Resilience:** loading/empty/error, Error Boundary, local cache fallback, double-click guard.
- **Security:** password hash (`bcryptjs`), JWT expiry, RBAC, server-side validation და transactional seat availability check. საჯარო deployment-მდე secret/CORS/HTTPS პარამეტრები უნდა შეიცვალოს.

## 4. ტექნოლოგიური სტეკი

- **Frontend:** React 18, TypeScript, Vite, React Router, Zustand + persist, React Hook Form, Zod, Lucide React.
- **Backend:** Node.js 20.11+, Express 4, `jsonwebtoken`, `bcryptjs`, `better-sqlite3` 12.10+ (Node.js 24-ის Windows გარემოს prebuilt binary თავსებადობისთვის).
- **Persistence:** SQLite (`server/data/gza.sqlite`) სერვერისთვის; Zustand persist + `localStorage` ფრონტენდის cache/demo მონაცემებისთვის.
- **Map:** Leaflet + OpenStreetMap tiles; რუკის განლაგება მუშაობს, tile-ები ინტერნეტზეა დამოკიდებული.
- **Code quality:** TypeScript, ESLint, Prettier, Node built-in test runner.
- **Version control:** Git/GitHub; რეკომენდებულია feature branch-ები და Conventional Commits.

## 5. Frontend და backend ფოლდერების სტრუქტურა

```text
src/
├── components/       # Header, Sidebar, cards, Portal modal, ErrorBoundary, ProtectedRoute
├── hooks/            # useDebounce, useFilterRoutes, useMediaQuery, useToast
├── layouts/          # shared Layout
├── pages/            # Routes, Bookings, About, Login, Register, role dashboards
├── services/         # API client, routes/bookings, auth, token storage
├── store/            # Zustand platform/auth state + persistence
├── types/            # TypeScript interfaces
├── utils/            # date/currency/ID helpers
├── styles/globals.css
├── App.tsx
└── main.tsx
server/
├── index.js          # Express routes, auth middleware, RBAC
├── db.js             # SQLite schema, indexes, seed data
└── domain.js         # booking/route validation and row mapping
tests/domain.test.js  # domain validation tests
```

## 6. Component Tree — მთავარი გვერდი

```text
ErrorBoundary
└── BrowserRouter + Suspense
    └── Layout
        ├── Header (menu, auth state, shared booking counter)
        ├── Sidebar / mobile navigation
        └── RoutesPage
            ├── StatCard × 4
            ├── Search / availability filter (350ms debounce)
            ├── RouteList (single parent Event Delegation listener)
            │   └── RouteCard × N (React.memo)
            ├── RouteFormModal (createPortal + RHF/Zod)
            └── Toast
```

`RoutesPage`, `BookingsPage` და `Header` მარშრუტებისა და ჯავშნების მონაცემებს Zustand-ის საერთო Store-დან იღებენ; ამიტომ მარშრუტის დამატება Header-ის მარშრუტების მრიცხველს, ხოლო ჯავშნის დამატება ჯავშნების მრიცხველსა და ჯავშნების გვერდს ავტომატურად აახლებს. HTTP მოთხოვნები ინახება `services/` ფენაში.

## 7. Routing და როლების მატრიცა

| URL | წვდომა | ფუნქცია |
|---|---|---|
| `/`, `/routes` | Public | მარშრუტების ძიება და საჯარო სია |
| `/routes/:id` | Public | ერთი მარშრუტის დეტალები და ადგილების რაოდენობის არჩევით დაჯავშნა |
| `/bookings` | Public UI, პერსონალიზებული სერვერული ჩანაწერები მხოლოდ token-ით | ჯავშნების ისტორია |
| `/about` | Public | პლატფორმის ინფორმაცია |
| `/login`, `/register` | Public | ავტორიზაცია / რეგისტრაცია |
| `/dashboard/driver` | driver/admin | მძღოლის სამუშაო სივრცე |
| `/dashboard/company` | company/admin | კომპანიის სამუშაო სივრცე |
| `POST/PUT/DELETE /api/routes` | driver/company/admin და owner check | მარშრუტის მართვა |
| `POST /api/bookings` | Guest ან authenticated user | ადგილის დაჯავშნა; backend გადამოწმება |
| `GET /api/bookings/mine` | Authenticated user | მხოლოდ საკუთარი ჯავშნები |

ფრონტენდის `ProtectedRoute` მხოლოდ UX ფენაა; უსაფრთხოების ძირითადი კონტროლი სრულდება Express middleware-ით.

## 8. ძირითადი მონაცემთა ტიპები

```ts
export type UserRole = 'passenger' | 'driver' | 'company' | 'admin';
export type AccountType = 'individual' | 'company';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountType: AccountType;
  companyName?: string;
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
  bookedAt: string;
  status: 'confirmed' | 'cancelled';
}
```

## 9. რეალიზებული API Endpoints — Draft და JSON მაგალითები

### `GET /api/health`

```json
{ "status": "ok", "service": "gza-logistics-api", "timestamp": "2026-10-21T10:00:00.000Z" }
```

### `POST /api/auth/register`

Request:

```json
{
  "fullName": "მარიამ ბერიძე",
  "email": "mariam@example.com",
  "phone": "+995555000000",
  "password": "DemoPass!23",
  "accountType": "individual",
  "role": "driver"
}
```

Response `201`:

```json
{
  "token": "<jwt-token>",
  "user": { "id": "user-id", "fullName": "მარიამ ბერიძე", "email": "mariam@example.com", "role": "driver", "accountType": "individual" }
}
```

### `POST /api/auth/login`

Request: `{ "email": "mariam@example.com", "password": "DemoPass!23" }`

Response: `{ "token": "<jwt-token>", "user": { "id": "user-id", "role": "driver" } }` (user object პასუხში უფრო სრულ ველებს შეიცავს).

### `GET /api/routes?from=თბილისი&to=ბათუმი&date=2026-10-24`

```json
[
  { "id": "route-001", "from": "თბილისი", "to": "ბათუმი", "departureDate": "2026-10-24", "departureTime": "09:00", "price": 35, "seatsAvailable": 4, "driverName": "გიორგი მაისურაძე", "vehicle": "Mercedes-Benz Sprinter", "createdAt": "2026-10-10T09:00:00.000Z" }
]
```

### `POST /api/routes`

Authorization: `Bearer <JWT>`; role `driver`, `company` ან `admin`.

```json
{
  "from": "თბილისი", "to": "ბათუმი", "departureDate": "2026-10-24", "departureTime": "09:00",
  "price": 35, "seatsAvailable": 4, "driverName": "გიორგი მაისურაძე", "vehicle": "Sprinter", "note": "ერთი გაჩერება"
}
```

Response `201`: ახლად შექმნილი მარშრუტის სრული JSON ობიექტი.

### `PUT /api/routes/:id` და `DELETE /api/routes/:id`

მოითხოვს JWT-ს, შესაბამის როლს და მარშრუტის მფლობელობას (ან admin უფლებას). წაშლა დაბლოკილია, თუ მარშრუტზე დადასტურებული ჯავშნები არსებობს.

### `POST /api/bookings`

```json
{ "routeId": "route-001", "seats": 1, "guestName": "მარიამ ბერიძე" }
```

Response `201`: `{ "booking": { "id": "booking-id", "routeId": "route-001", "seats": 1, "status": "confirmed", "price": 35 }, "route": { "id": "route-001", "seatsAvailable": 3 } }` (route/booking JSON-ში მოცემულია დამატებითი ველებიც). თუ ადგილები არ კმარა, response არის `409 Conflict`.

### `GET /api/bookings/mine`

Authorization: `Bearer <JWT>`; აბრუნებს მხოლოდ მიმდინარე მომხმარებლის ჯავშნების სიას.

### `GET /api/dashboard/stats`

Authorization: `Bearer <JWT>`; `driver/company/admin` როლებისთვის აბრუნებს route count, available routes, open seats და booking count-ს.

### `GET /api/wallet` და `POST /api/wallet/topup`

ორივე endpoint მოითხოვს `Bearer <JWT>`-ს. `GET /api/wallet` აბრუნებს მიმდინარე ბალანსსა და მაქსიმუმ 100 უახლეს ტრანზაქციას. `POST /api/wallet/topup` იღებს `{ "amount": 50 }`-ს, დასაშვები დიაპაზონია 1–5000 GEL და აბრუნებს ახალ ბალანსსა და ტრანზაქციას. ეს არის **ფინანსური სიმულაცია** და არა რეალური გადახდა.

## 10. ავტორიზაციისა და უსაფრთხოების მოდელი

- პაროლი ინახება `bcryptjs`-ით მიღებული hash-ის სახით, არა plain text-ად.
- API გასცემს 8-საათიან JWT access token-ს; request-ზე token მოწმდება middleware-ით.
- რეგისტრაციას არ შეუძლია `admin` როლის შექმნა.
- `POST /api/routes` მოითხოვს `driver/company/admin`; PUT/DELETE დამატებით ამოწმებს route owner-ს.
- `POST /api/bookings` იყენებს SQLite transaction-ს და პირობით UPDATE-ს; UI double-click lock მხოლოდ დამატებითი დაცვაა, არა სერვერის ჩანაცვლება.
- ნებისმიერი ავტორიზებული მომხმარებლის ჯავშანი ბალანსს ამოწმებს/აკლებს, ხოლო რეისის სხვა მომხმარებლის დაჯავშნისას route owner-ს შემოსავალი ემატება wallet ledger-ში. Top-up არის სიმულაცია და არა რეალური გადახდა. საჯარო deploy-მდე აუცილებელია ძლიერი `JWT_SECRET`, HTTPS, მკაცრი CORS და secret-ების უსაფრთხო მართვა.

## 11. ვალიდაციის სქემები

- Full name: required, მინიმუმ 2 სიმბოლო.
- Email: required, ვალიდური ფორმატი და სერვერზე unique.
- Phone: optional, თუ მითითებულია — მაქსიმუმ 32 სიმბოლო (სასურველია ნორმალიზაცია).
- Password: მინიმუმ 8 სიმბოლო, ერთი ციფრი და ერთი სპეციალური სიმბოლო; პაროლის გამეორება frontend-ზე მოწმდება.
- Account type: `individual | company`; company ანგარიშზე კომპანიის სახელი სავალდებულოა.
- Route: `from/to` მინ. 2 სიმბოლო და განსხვავებული; თარიღი/დრო; ფასი 1–100000; seatsAvailable integer 0–60.
- Booking: requested seats integer 1–60; სერვერის transaction ამოწმებს რეალურ ხელმისაწვდომობას.

## 12. სახელმწიფო და persistence

`src/store/usePlatformStore.ts` მართავს routes/bookings კოლექციებს, loading/source state-ს და CRUD/book actions-ს. Zustand `persist` ინახავს მონაცემებს `gza.platform.store.v1`-ში; სერვისები დამატებით ინახავენ routes/bookings cache-ს fallback რეჟიმისთვის. `src/store/useAuthStore.ts` მართავს user/token state-ს, ხოლო token helper ინახავს access token-ს ცალკე key-ში. ეს browser persistence არ ცვლის SQLite-ს — backend DB არის სერვერული source of truth, როცა API ხელმისაწვდომია.

## 13. რა საჭიროებს ხელით ვერიფიკაციას

- `npm install`, `npm run test`, `npm run lint`, `npm run build` მომხმარებლის კომპიუტერზე.
- რეალური API flow: register/login/create route/book/overbook conflict.
- Chrome და Firefox/Edge; Device Toolbar 375/768/1440px.
- DevTools breakpoint, Call Stack, Scope, Watch Expressions სქრინები.
- GitHub public repository, board და სურვილისამებრ live deploy მხოლოდ რეალური შექმნის შემდეგ უნდა მიეთითოს.


## 14. რისკების ანალიზი

| რისკი | გავლენა | შემცირების გზა | დარჩენილი შეზღუდვა |
|---|---|---|---|
| ერთსა და იმავე რეისზე პარალელური ჯავშნები | ადგილების ზედმეტი გაყიდვა | SQLite transaction, conditional `UPDATE ... seats_available >= ?` და `409 Conflict` | რეალურ დატვირთვაზე საჭიროა production DB/monitoring ტესტები |
| API-ის გათიშვა ან ქსელის პრობლემა | მონაცემების ჩატვირთვა ვერ ხერხდება | ბოლო localStorage cache ან demo data და თვალსაჩინო banner | Offline booking არის მხოლოდ ამ ბრაუზერის demo ჩანაწერი და არ ასინქრონდება სერვერზე ავტომატურად |
| სუსტი JWT secret / არასწორი CORS | ანგარიშის უსაფრთხოების რისკი | `.env.example`, `.gitignore`, JWT expiry და RBAC | საჯარო გაშვებამდე აუცილებელია საიდუმლოს შეცვლა, HTTPS და production CORS |
| `better-sqlite3`-ის დაყენების პრობლემა | API ვერ გაეშვება | Node.js 20.11+ და README ინსტრუქცია | სტუდენტის გარემოში `npm install`/build ჯერ ხელით უნდა გაიშვას |
| OpenStreetMap tile-ების მიუწვდომლობა | რუკა სრულად ვერ გამოჩნდება | რუკა არ არის კრიტიკული ძიების/დაჯავშნისთვის; ქალაქის ტექსტური მონაცემები რჩება | რუკის tile-ებს ინტერნეტი სჭირდება |
| კროს-ბრაუზერული განსხვავებები | UI ან კონტროლის პრობლემა | Responsive CSS, native controls და ხელით smoke test-ის checklist | Chrome/Firefox/Edge-ის რეალური ტესტი და სქრინშოტები ჯერ დასასრულებელია |

