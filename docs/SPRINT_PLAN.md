# Sprint 1 — Backlog, Story Points და Timeline

**პროექტი:** გზა — ლოჯისტიკური პლატფორმა

**Planning Poker:** ეს არის ინდივიდუალური სტუდენტისთვის შეთავაზებული საწყისი შეფასებები. გუნდური მუშაობისას თითოეული estimate განხილვით უნდა შეთანხმდეს.

## Sprint 1 — 10 ძირითადი Task

| ID | Task | Story Points | პრიორიტეტი | სტატუსის რეკომენდაცია |
|---|---|---:|---|---|
| GZA-01 | Vite/React/TypeScript საწყისი სტრუქტურის შექმნა | 2 | მაღალი | წყაროშია; build ვერიფიკაცია საჭიროა |
| GZA-02 | CSS design tokens, reset და globals.css | 3 | მაღალი | წყაროშია; ვიზუალური QA საჭიროა |
| GZA-03 | Responsive app layout, Header, Sidebar, Footer | 5 | მაღალი | წყაროშია; 375/768/1440px QA საჭიროა |
| GZA-04 | მარშრუტის მონაცემთა მოდელი და API/cache service | 3 | მაღალი | წყაროშია; API smoke test საჭიროა |
| GZA-05 | მარშრუტების ბარათი და list component | 3 | მაღალი | წყაროშია; browser test საჭიროა |
| GZA-06 | Debounce ძიება და ხელმისაწვდომობის ფილტრი | 3 | მაღალი | წყაროშია; ფუნქციური test საჭიროა |
| GZA-07 | Add/Edit modal Portal + React Hook Form/Zod | 5 | მაღალი | წყაროშია; validation screenshot საჭიროა |
| GZA-08 | Delete flow, toast და double-booking protection | 5 | მაღალი | წყაროშია; API edge-case test საჭიროა |
| GZA-09 | Error Boundary, loading/empty/demo fallback states | 3 | მაღალი | წყაროშია; failure scenario test საჭიროა |
| GZA-10 | Responsive QA, Keyboard focus და Debugging instrumentation | 5 | მაღალი | ხელით შესამოწმებელი ეტაპი |

**ჯამი: 37 Story Points.** ეს არის საწყისი შეფასება და არა შესრულების დამადასტურებელი ისტორია. Story Points შედარებითი შეფასებაა და პირდაპირ სამუშაო საათებს არ უდრის.

## Kanban board columns

შექმენი Trello/Jira/GitHub Projects board ამ სვეტებით:

`Backlog` → `To Do` → `In Progress` → `Code Review / QA` → `Done`

დაფაზე დაამატე ზემოთ ჩამოთვლილი GZA-01…GZA-10 ტასკები. ეს Markdown ცხრილი board-ის ლინკს არ ანაცვლებს — საჯარო დაფა სტუდენტმა საკუთარ ანგარიშში უნდა შექმნას.

## სავარაუდო Timeline

| თარიღი | ეტაპი | შედეგი |
|---|---|---|
| 22–23 ოქტომბერი 2026 | Tech Spec-ის განახლება, API/DB და Store-ის შემოწმება | endpoint checklist და role matrix |
| 24–25 ოქტომბერი 2026 | UI, ფორმები და მარშრუტების CRUD | modal, validation, debounce |
| 26–27 ოქტომბერი 2026 | ჯავშნის API და overbooking სცენარები | API + database checks |
| 28–29 ოქტომბერი 2026 | responsive, accessibility, performance | 375/768/1440px QA |
| 30 ოქტომბერი 2026 | build/lint, GitHub, screenshot-ები და audit | საბოლოო ჩასაბარებელი მტკიცებულებები |

ეს არის ახალი სავარაუდო Timeline (შეთანხმებული თარიღები საჭიროებისამებრ შეიცვლება) და არა შესრულების ისტორიის მტკიცებულება.

## Git branching და Conventional Commits

- `main` — სტაბილური ვერსია.
- `feat/route-management` — მარშრუტების CRUD და ბარათები.
- `feat/responsive-layout` — responsive layout და mobile nav.
- `fix/form-validation` — ვალიდაციის შეცდომების გასწორება.
- `docs/project-planning` — ტექნიკური დოკუმენტაცია.

მაგალითი commit მესიჯები:

```text
chore: scaffold Vite React TypeScript project
style: add global design tokens and mobile layout
feat: add route management cards and filters
feat: add route create and edit modal with Zod validation
fix: prevent duplicate demo bookings on rapid clicks
docs: add technical spec and sprint planning
```

მცირე, თემატური კომიტები შექმენი; პროექტის მთელი შიგთავსი ერთ giant commit-ად არ დაამატო.

## დამატებითი backlog — API და Global State

| Task | Story Points | შემოწმების კრიტერიუმი |
|---|---:|---|
| Express API + SQLite schema და seed data | 5 | `/api/health` და `GET /api/routes` პასუხობს |
| JWT authentication, password hashing და RBAC | 8 | driver/company რეგისტრაცია/შესვლა და დაცული CRUD |
| Atomic booking transaction | 8 | API-ით ორმაგი ჯავშანი აბრუნებს `409` |
| Zustand store + localStorage persistence | 5 | routes/bookings/Header counter ერთად ახლდება და refresh-ის შემდეგ რჩება |
| React Hook Form + Zod და route-level lazy loading | 5 | ფორმის validation და Suspense route fallback |

ეს დამატებითი შეფასებები საერთო საწყის სპრინტში არ არის შეტანილი 37 SP ჯამში.
