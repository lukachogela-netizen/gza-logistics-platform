# გზა — ლოჯისტიკური და ტრანსპორტირების პლატფორმა

React/TypeScript სასწავლო ვებაპლიკაცია მარშრუტების ძიებისთვის, რეისების მართვისთვის და ადგილების დასაჯავშნად. პროექტს აქვს ცალკე Express API, SQLite მონაცემთა ბაზა, JWT ავტორიზაცია და ადგილობრივ დემო რეჟიმზე დაბრუნების შესაძლებლობა, როცა API მიუწვდომელია.

> **სტატუსი:** ეს არის სასწავლო პროექტის წყარო. ჯერ არ არის ატვირთული GitHub-ზე, არ არის განთავსებული საჯარო ჰოსტინგზე და საჭიროა სტუდენტის კომპიუტერზე `npm install`, build და ბრაუზერების ხელით ტესტირება. რეალური DevTools/Figma/Trello ბმულები არ არის გამოგონილი.

## ფუნქციები

- მარშრუტების საჯარო სია, საძიებო ველი და ხელმისაწვდომობის ფილტრები.
- 350ms debounce საძიებო ველზე; ფილტრაცია `useMemo`-ით.
- მარშრუტის დამატება/რედაქტირება `ReactDOM.createPortal` მოდალში; წაშლა და ფორმის ვალიდაცია React Hook Form + Zod-ით.
- მომხმარებლის რეგისტრაცია/შესვლა, პაროლის hash-ად შენახვა და JWT-ზე დაფუძნებული ავტორიზაცია.
- როლები: მგზავრი, მძღოლი, კომპანია და ადმინისტრატორი; მართვის API-ები შეზღუდულია როლისა და საკუთრების მიხედვით.
- Express REST API მარშრუტების, ავტორიზაციისა და ჯავშნებისთვის.
- SQLite მონაცემთა ბაზა (`server/data/gza.sqlite`), ცხრილები და ინდექსები.
- ინტერაქტიული რუკა (Leaflet + OpenStreetMap) პოპულარული ქართული ქალაქების მარშრუტებისთვის.
- სატესტო საფულე: ბალანსის top-up სიმულაცია, ავტორიზებული მომხმარებლის ჯავშნის ჩამოჭრის ჩანაწერი და მძღოლის/გადამზიდის რეისიდან შემოსავლის ledger; რეალური გადახდები გამორთულია.
- ჯავშნისას SQLite ტრანზაქცია და თავისუფალი ადგილების პირობითი განახლება, რაც სერვერზე overbooking-ს ბლოკავს.
- Zustand გლობალური Store მარშრუტებისა და ჯავშნებისთვის; `persist` ინახავს მათ `localStorage`-ში და ცვლილებებს აჩენს Header-ის counter-შიც.
- React Router-ის lazy-loaded გვერდები, `Suspense`, `React.memo`, `useMemo` და `useCallback`.
- API-ის გათიშვისას ბოლო ქეშის ან დემო მონაცემების ჩვენება და შესაბამისი ბანერი.
- Error Boundary, Loading/Empty/Error მდგომარეობები, double-click guard, `console.table()`, `console.time()` / `console.timeEnd()`.
- სემანტიკური HTML, კლავიატურის focus-visible მდგომარეობები, Escape/overlay დახურვის მხარდაჭერა მოდალში.
- CSS Variables, Grid, Flexbox, მობილური hamburger მენიუ და responsive layout.

## ტექნოლოგიური სტეკი

- **Frontend:** React 18, TypeScript, Vite, React Router, Zustand, React Hook Form, Zod, Lucide React.
- **Backend:** Node.js 20.11+, Express 4, JWT (`jsonwebtoken`), პაროლის hash (`bcryptjs`).
- **Database:** SQLite (`better-sqlite3` 12.10+; includes prebuilt binaries for Node.js 24 on supported platforms).
- **Code quality:** ESLint, Prettier, Node test runner.

## მოთხოვნები გასაშვებად

- Node.js 20.11 ან უფრო ახალი (რეკომენდებულია მიმდინარე LTS).
- npm და ინტერნეტი პირველი `npm install`-ისთვის.
- SQLite მონაცემთა ბაზის ფაილი ავტომატურად შეიქმნება `server/data/` საქაღალდეში.

## ლოკალურად გაშვება

საჭიროა Node.js 20.11 ან უფრო ახალი ვერსია და npm. თუ პროექტი GitHub-ზე აიტვირთა, კლონირებისთვის გამოიყენე შენი რეალური repository URL (ქვემოთ მოცემული მისამართი მხოლოდ შაბლონია):

```bash
git clone https://github.com/<your-github-username>/gza-logistics-platform.git
cd gza-logistics-platform
npm install
npm run dev:full
```

თუ ZIP არქივი გაქვს, ამოარქივე და გახსენი პროექტის ძირეული საქაღალდე VS Code-ში, შემდეგ იგივე `npm install` და `npm run dev:full` ბრძანებები გაუშვი. საჭიროების შემთხვევაში შექმენი `.env` ფაილი `.env.example`-ის კოპირებით. ნაგულისხმევი API URL არის `http://localhost:4000/api`.

Vite-ის მიერ ნაჩვენები URL გახსენი ბრაუზერში — ჩვეულებრივ `http://localhost:5173`. Backend health endpoint: `http://localhost:4000/api/health`. ორივე სერვერის შესაჩერებლად ტერმინალში დააჭირე `Ctrl+C`.

მხოლოდ `npm run dev` უშვებს ფრონტენდს; სრულფასოვანი API-სთვის გამოიყენე `npm run dev:full`. თუ API არ მუშაობს, UI გადადის ადგილობრივ demo/cache რეჟიმზე. მართვის API-ის დასატესტად დარეგისტრირდი მძღოლის ან კომპანიის ანგარიშით.

## ტესტირება და ხარისხის შემოწმება

```bash
npm test
npm run lint
npm run build
# API smoke test-ისთვის ჯერ გაუშვი npm run dev:full სხვა ტერმინალში
npm run test:api
```

`npm run test:api` ამოწმებს API health-ს, JWT რეგისტრაციას, მარშრუტის შექმნას, ერთი ადგილის წარმატებულ დაჯავშნას, ადგილის რაოდენობის შემცირებასა და შემდეგი დაჯავშნის უარყოფას (HTTP 409); ის დროებით სატესტო ანგარიშსა და მარშრუტს ქმნის და ბოლოს შლის. შემდეგ ხელით შეამოწმე Chrome და Firefox ან Edge; DevTools Device Toolbar-ში 375px, 768px და 1440px; რეგისტრაცია/შესვლა, CRUD, modal validation, booking, offline fallback და კლავიატურის ნავიგაცია. ეს ბრაუზერული შემოწმებები და მათი რეალური სქრინშოტები შენს კომპიუტერზე უნდა შესრულდეს — პროექტში ყალბი მტკიცებულებები არ არის ჩასმული.

## REST API

| Method | Endpoint | აღწერა |
|---|---|---|
| `GET` | `/api/health` | API health check |
| `POST` | `/api/auth/register` | რეგისტრაცია |
| `POST` | `/api/auth/login` | ავტორიზაცია, JWT |
| `GET` | `/api/auth/me` | მიმდინარე მომხმარებელი (JWT) |
| `GET` | `/api/routes` | საჯარო მარშრუტების სია; შეუძლია query ფილტრებს |
| `GET` | `/api/routes/:id` | ერთი მარშრუტი |
| `POST` | `/api/routes` | მარშრუტის დამატება; driver/company/admin |
| `PUT` | `/api/routes/:id` | მარშრუტის განახლება; owner/admin |
| `DELETE` | `/api/routes/:id` | მარშრუტის წაშლა; owner/admin, აქტიური ჯავშნების გარეშე |
| `POST` | `/api/bookings` | სტუმრის ან ავტორიზებული მომხმარებლის ჯავშანი; სერვერული overbooking დაცვა |
| `GET` | `/api/bookings/mine` | მიმდინარე მომხმარებლის ჯავშნები (JWT) |
| `GET` | `/api/wallet` | ბალანსი და ტრანზაქციების ისტორია (JWT) |
| `POST` | `/api/wallet/topup` | სატესტო ბალანსის შევსება (JWT; არ არის რეალური გადახდა) |
| `GET` | `/api/dashboard/stats` | როლზე დამოკიდებული სტატისტიკა |

რეგისტრაციის მაგალითი:

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

ჯავშნის მაგალითი:

```json
{
  "routeId": "route-001",
  "seats": 1,
  "guestName": "მარიამ ბერიძე"
}
```

სერვერი პაროლებს plain text-ად არ ინახავს. საჯარო deploy-მდე აუცილებლად შეცვალე `JWT_SECRET`, დააკონფიგურირე CORS წარმოშობის დომენი, HTTPS და მონაცემთა ბაზის სარეზერვო პოლიტიკა.

## პროექტის სტრუქტურა

```text
src/
├── components/       # Header, Sidebar, cards, modal, ErrorBoundary, auth guards
├── hooks/            # useDebounce, useFilterRoutes, useMediaQuery, useToast
├── layouts/          # საერთო Layout
├── pages/            # Routes, Bookings, About, Login, Register, role dashboards
├── services/         # API client, routes/bookings, auth, token storage
├── store/            # Zustand platform/auth stores with persistence
├── styles/           # Design tokens და responsive CSS
├── types/            # TypeScript data models
├── utils/            # date/currency helpers
└── App.tsx
server/
├── index.js          # Express API, auth, RBAC, route/booking endpoints
├── db.js             # SQLite schema, indexes, demo seeding
└── domain.js         # domain validation/mapping
```

## დოკუმენტაცია

- `docs/MASTER_REQUIREMENTS_CHECKLIST.md` — ყველა მიღებული დავალების აუდიტი და ხელით შესასრულებელი მტკიცებულებები.
- `docs/TECH_SPEC.md` — ბიზნესლოგიკა, არქიტექტურა, route matrix და API draft.
- `docs/SPRINT_PLAN.md` — Sprint-ის ტასკები, Story Points და Timeline.
- `docs/UX_AND_INTERACTIONS.md` — User Flow, wireframes-ის აღწერა და micro-interactions.
- `docs/DEBUGGING_JOURNAL.md` — ორი ბაგის ანალიზი.
- `docs/QA_REPORT.md` — მინიმუმ სამი პოტენციური ხარვეზი, შემოწმების სცენარები და რეალური მტკიცებულებების სტატუსი.
- `docs/FINAL_AUDIT_TEMPLATE.md` და `docs/IV_WEEK_AUDIT_TEMPLATE.docx` — შემაჯამებელი აუდიტის ტექსტი/შაბლონი.
- `docs/SUBMISSION_CHECKLIST.md` — ატვირთვამდე დარჩენილი მოქმედებები.

## Git-ის რეკომენდებული სამუშაო ნაკადი

ცვლილებები დაყავი ლოგიკურ კომიტებად. `git add .`-ით მთელი პროექტის ერთიანად stage/commit არ გააკეთო.

```bash
git init
git branch -M main
git switch -c feat/api-auth
# შეცვალე და შეამოწმე auth ფაილები
git add server/index.js server/db.js src/pages/LoginPage.tsx src/pages/RegisterPage.tsx
git commit -m "feat: add JWT authentication and role-based access"
```

საჯარო GitHub repository, board URL და live demo ამ ეტაპზე ჯერ არ შექმნილა. ისინი მხოლოდ რეალურად შექმნის შემდეგ უნდა ჩაიწეროს დოკუმენტაციაში.
