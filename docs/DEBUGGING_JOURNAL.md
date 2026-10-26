# Debugging Journal — 2 სიმულირებული ქეისი

> ქვევით მოყვანილი შემთხვევები სასწავლო სიმულაციებია. სტუდენტმა უნდა დაადასტუროს ისინი გაშვებულ აპლიკაციაში საკუთარი DevTools სქრინებით; ისინი არ უნდა ჩაითვალოს რეალური ბრაუზერის სქრინმტკიცებულებად.

## ქეისი 1 — მარშრუტის ადგილი ორჯერ დაიჯავშნა სწრაფი დაჭერით

1. **სიმპტომი:** მომხმარებელი სწრაფად ორჯერ აჭერს „დაჯავშნას“ და UI-ში შეიძლება ერთზე მეტი მოთხოვნის იმიტაცია მიიღოს.
2. **ჰიპოთეზა:** state-ის ასინქრონული განახლება მეორე click-მდე ვერ ასწრებს ღილაკის disabled მდგომარეობაში გადაყვანას.
3. **DevTools დიაგნოსტიკა:** Chrome DevTools → Sources-ზე breakpoint booking handler-ში; Scope-ში შემოწმდეს routeId, current seats და lock state; Network-ში რეალური backend-ის არსებობისას შემოწმდეს POST `/api/bookings`-ების რაოდენობა.
4. **Root Cause:** UI state მარტო საკმარისი არ არის სწრაფი ზედიზედ მოქმედებების დასაბლოკად.
5. **კოდის ფიქსი:** დაემატა per-route `Set` lock, pending/loading state და ადგილების ხელახალი შემოწმება. რეალურ backend-ში booking უნდა შესრულდეს ატომური DB transaction-ით და არა მხოლოდ ფრონტენდის lock-ით.
6. **პრევენცია:** rapid-click QA, API idempotency key, DB constraint/transaction და 409 Conflict სცენარის ტესტი.

## ქეისი 2 — API-ის გათიშვისას მარშრუტების გვერდი ცარიელი იყო

1. **სიმპტომი:** backend-ის მიუწვდომლობისას მარშრუტების სია ვერ იტვირთება.
2. **ჰიპოთეზა:** მონაცემების ჩატვირთვის ფუნქციას არ ჰქონდა catch/fallback განშტოება.
3. **DevTools დიაგნოსტიკა:** Network-ში გამორთეთ ქსელი ან გამოიყენეთ API მისამართი, რომელიც შეცდომას აბრუნებს; Console-ში დააკვირდით fetch error-ს; breakpoint დააყენეთ `getRoutes()` catch ბლოკში.
4. **Root Cause:** UI მხოლოდ API პასუხზე იყო დამოკიდებული და არ კითხულობდა cache/demo მონაცემებს.
5. **კოდის ფიქსი:** `routesService.getRoutes()` ცდილობს API მოთხოვნას, შეცდომაზე კითხულობს localStorage cache-ს ან იყენებს demo routes-ს, ხოლო UI აჩვენებს fallback banner-ს.
6. **პრევენცია:** offline test, response status checks, malformed localStorage მონაცემის ტესტი და loading/empty/error state-ების ცალკე შემოწმება.

## Debugging instrumentation

`src/store/usePlatformStore.ts`-ის `initialize()` მოქმედებაში გამოიყენება დროის დინამიკური label და ცხრილის ლოგირება:

```ts
const timingLabel = `platform-initialize-${Date.now()}`;
console.time(timingLabel);
// API ან cache-დან მარშრუტებისა და ჯავშნების ჩატვირთვა
console.table(routeResult.routes.map(({ from, to, departureDate, seatsAvailable, price }) => ({
  from, to, departureDate, seatsAvailable, price,
})));
console.timeEnd(timingLabel);
```

DevTools evidence to capture:

- Sources პანელში breakpoint დაყენებული `initialize()` ან booking handler-ში.
- მარჯვენა პანელზე Call Stack და Scope ცვლადები.
- Watch Expressions: `routeId`, `route.seatsAvailable`, `bookingLock.current.size` (მოცემული scope-ში ხელმისაწვდომი სახელების მიხედვით).
- Console-ში `console.table` და `platform-initialize-...ms` დროის ჩანაწერი.
