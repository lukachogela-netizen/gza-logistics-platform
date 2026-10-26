# ჩასაბარებელი მასალების checklist

## კოდში/დოკუმენტაციაში დამატებული საფუძვლები

- [x] React + Vite + TypeScript scaffold, responsive layout, semantic HTML.
- [x] Route search/filter/debounce, Add/Edit Portal modal, delete confirmation.
- [x] React Hook Form + Zod validation.
- [x] Zustand global routes/bookings store + localStorage persistence.
- [x] Express API, SQLite schema, JWT auth, password hashing, RBAC, route CRUD.
- [x] Booking endpoint with SQLite transaction and overbooking guard.
- [x] API/cache/demo fallback, Error Boundary, debug console instrumentation.
- [x] React.lazy/Suspense, useMemo/useCallback, memoized route cards.
- [x] Tech Spec, API draft, sprint Story Points/Timeline, UX interaction analysis, debugging journal, Design Tokens, SVG wireframes, master checklist.
- [x] Basic domain validation tests (`node --test`); server JS syntax checks passed in the authoring environment.

## აუცილებლად შესასრულებელი შენს კომპიუტერში

- [ ] ZIP ამოარქივე ახალ, ცალკე საქაღალდეში.
- [ ] Node.js 20.11+ დააინსტალირე.
- [ ] გაუშვი `npm install` (საჭიროა ინტერნეტი).
- [ ] გაუშვი `npm test`, `npm run lint` და `npm run build`; build/lint error-ის შემთხვევაში გაასწორე და თავიდან გაუშვი.
- [ ] გაუშვი `npm run dev:full`; შეამოწმე `http://localhost:4000/api/health` და frontend Vite URL.
- [ ] რეალურად შეამოწმე register/login, driver route create/edit/delete, guest booking, booking counter და overbooking conflict.
- [ ] Chrome-ში სრული smoke test; ასევე Firefox ან Edge.
- [ ] Device Toolbar: 375px მობილური, 768px პლანშეტი, 1440px desktop.
- [ ] გადაიღე ნამდვილი სქრინები: desktop/mobile, form validation, API+DB მუშაობა, offline fallback, Error Boundary და DevTools breakpoint/Call Stack/Scope/Watch.
- [ ] შექმენი Trello/Jira/GitHub Projects board ხუთი სვეტით და დაამატე მინიმუმ 8–10 task Story Points-ებით; ჩაიწერე რეალური public URL.
- [ ] Git-ში შექმენი branch-ები და მცირე Conventional Commits; საჯარო GitHub repository შექმენი და push გააკეთე.
- [ ] README-ში და audit-ში ჩასვი რეალური GitHub/board/Live Demo ბმულები.
- [ ] შეავსე საბოლოო Word/PDF audit 5 პუნქტითა და რეალური screenshot-ებით.

## რაც ამ ეტაპზე არ უნდა ჩაითვალოს შესრულებულად

- Public GitHub/Trello/Live Demo ბმულები ჯერ არ არსებობს.
- Cross-browser და device tests ჯერ არ არის ფაქტობრივად ჩატარებული.
- DevTools breakpoint screenshot ჯერ არ არის გადაღებული.
- npm dependencies ვერ ჩამოიტვირთა ამ ავტორინგ გარემოში დროის ამოწურვის გამო; შესაბამისად TypeScript build-ის წარმატება ჯერ დადასტურებული არ არის.
- `OPEN-DEMO.html` მხოლოდ standalone preview-ია და React/Express source პროექტს არ ცვლის.
