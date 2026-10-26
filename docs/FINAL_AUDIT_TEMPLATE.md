# IV კვირის შემაჯამებელი დავალება — თვითშეფასება და ტექნიკური აუდიტი

**სტუდენტის სახელი და გვარი:** [შეავსე]

**GitHub რეპოზიტორიის საჯარო ბმული:** [ატვირთვის შემდეგ ჩასვი აქ]

**Live Demo ბმული:** [თუ Vercel/Netlify-ზე განათავსებ, ჩასვი აქ]

> სანამ ჩააბარებ, პასუხები გადაამოწმე გაშვებულ პროექტთან. ეს სამუშაო შაბლონია: პასუხების საბოლოო ფორმულირება და screenshots უნდა გადაამოწმო გაშვებულ პროექტთან და რეალურ Git ისტორიასთან. ამ ეტაპზე GitHub/Live Demo არ შექმნილა, ხოლო build/lint და ხელით browser ტესტები ჯერ დასადასტურებელია.

## 1. დაგეგმვა და Git ვერსიების მართვა

**პასუხი:** პროექტი „გზა“ არის React/TypeScript ფრონტენდი და Express/SQLite ბექენდი მარშრუტებისა და ჯავშნების სამართავად. ტექნიკური სტეკი, API, მონაცემთა მოდელები და დაგეგმვა აღწერილია `README.md`-სა და `docs/` დოკუმენტებში. GitHub რეპოზიტორია ჯერ არ შექმნილა; ტესტირების შემდეგ საჭიროა `main` + feature branch-ები და მცირე Conventional Commits, რასაც რეალური `git log` უნდა ადასტურებდეს.

**Screenshot checklist:**
- [ ] GitHub repository overview, სადაც ჩანს Public/Private სტატუსი და README.
- [ ] Branches გვერდი.
- [ ] Commits ისტორია ან ტერმინალის `git log --oneline --graph`.

## 2. სემანტიკური HTML5 და მოდულური არქიტექტურა

**პასუხი:** გვერდებში გამოყენებულია `header`, `nav`, `main`, `section`, `article`, `aside`-ის საჭიროების შესაბამისი გამოყენება და `footer`; მარშრუტის ბარათები `article`-ია, ხოლო „პლატფორმის შესახებ“ გვერდის ილუსტრაცია `figure`/`figcaption`-ითაა წარმოდგენილი. ფაილები გამოყოფილია `components/`, `hooks/`, `services/`, `types/`, `pages/`, `layouts/` და `utils/` დირექტორიებში; ეს ამცირებს პასუხისმგებლობების გადაფარვასა და დუბლირებულ კოდს.

**Screenshot checklist:**
- [ ] VS Code Explorer სრული `src/` tree-ით.
- [ ] `RouteCard.tsx` ან `Layout.tsx` კოდის ფრაგმენტი.
- [ ] `globals.css` ან `RouteFormModal.tsx`.

## 3. დიზაინ-სისტემა და რესპონსიულობა

**პასუხი:** Design Tokens განსაზღვრულია `src/styles/globals.css` ფაილის `:root` ბლოკში: ძირითადი ფერები, spacing, radius და shadow. Sidebar-ის მაკრო-layout იყენებს Grid-ს, შიდა კომპონენტები Flexbox-ს, ხოლო მარშრუტების grid `auto-fit/minmax` მიდგომით ადაპტირდება; 960px-მდე ნავიგაცია hamburger მენიუში გადადის.

**Screenshot checklist:**
- [ ] Desktop 1440px — Chrome DevTools Device Toolbar.
- [ ] Mobile 375px — hamburger ღილაკი, გახსნილი მენიუ და 1-სვეტიანი route grid.
- [ ] (რეკომენდებულია) Tablet 768px.

## 4. ინტერაქტიულობა, მოდალები და წარმადობა

**პასუხი:** საძიებო ველი `useDebounce` custom hook-ით 350ms-ით აყოვნებს filter update-ს, რათა ყოველ კლავიშზე მძიმე მოთხოვნა არ გაეშვას. Add/Edit ფორმა `createPortal`-ით იხსნება, Zod ამოწმებს სავალდებულო ველებს, ხოლო `transform`/`opacity` ეფექტები და hover states უზრუნველყოფს მსუბუქ უკუკავშირს; მარშრუტების სიაში click handler მშობელ wrapper-ზეა (Event Delegation).

**Screenshot checklist:**
- [ ] ღია modal, სადაც ჩანს validation error (მინიმუმ ერთი ველი განზრახ არასწორად შეავსე).
- [ ] `useDebounce.ts` ან `RouteFormModal.tsx` კოდის ფრაგმენტი.
- [ ] (რეკომენდებულია) Event Delegation listener-ის ფრაგმენტი.

## 5. Resilience და Debugging

**პასუხი:** მთავარ აპს Error Boundary იცავს და შეცდომისას Fallback UI-ს Retry ღილაკით აჩვენებს. API base URL-ის გამართვისას მოთხოვნის ჩავარდნა გადადის localStorage cache/demo მონაცემებზე და აჩენს ბანერს; ჯავშნის ღილაკს აქვს loading/disabled მდგომარეობა, ხოლო Console instrumentation იყენებს `console.table()`, `console.time()` და `console.timeEnd()`.

**Screenshot checklist:**
- [ ] Fallback banner „ლოკალური დემო რეჟიმი“ ან Error Boundary-ის Fallback UI.
- [ ] DevTools Console, სადაც ჩანს `console.table` და `platform-initialize-*` დროის label (`console.time`/`console.timeEnd`).
- [ ] Sources breakpoint, Call Stack, Scope და Watch Expressions.

## საბოლოო შემოწმება

- [ ] `npm install` წარმატებით დასრულდა.
- [ ] `npm run build` შეცდომის გარეშე დასრულდა (ამ გარემოში ჯერ ვერ დადასტურდა).
- [ ] Add/Edit/Delete ფუნქციები გამოცდილია.
- [ ] Search debounce და no-results state გამოცდილია.
- [ ] Booking loading/duplicate click behavior გამოცდილია.
- [ ] 375px და 1440px responsive screenshots გადაღებულია.
- [ ] GitHub repository public-ია (თუ მასწავლებელი ამას ითხოვს) და README-ში ჩასმულია პროექტის მოკლე აღწერა.
- [ ] GitHub და, თუ გაქვს, Live Demo რეალური URLs ამ დოკუმენტში ჩასმულია.
