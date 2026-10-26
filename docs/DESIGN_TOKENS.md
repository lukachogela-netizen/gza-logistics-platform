# Design Tokens — გზა

## ფერების პალიტრა

| Token | HEX | გამოყენება |
|---|---|---|
| `--color-primary` | `#087F8C` | ძირითადი CTA, აქტიური ბმულები |
| `--color-primary-dark` | `#06636D` | Hover/active მდგომარეობა |
| `--color-bg` | `#F5F7FA` | გვერდის ფონი |
| `--color-surface` | `#FFFFFF` | ბარათები და მოდალები |
| `--color-text` | `#172B3A` | ძირითადი ტექსტი |
| `--color-text-muted` | `#718096` | მეორეხარისხოვანი ტექსტი |
| `--color-border` | `#E4EAF0` | საზღვრები და გამყოფები |
| `--color-danger` | `#C2414D` | შეცდომა/წაშლა |
| `--color-success` | `#198754` | წარმატება/ხელმისაწვდომობა |

## 8px-ზე დაფუძნებული დაშორებები

- `--space-xs`: 4px (გამონაკლისი მცირე inline gap-ებისთვის)
- `--space-sm`: 8px
- `--space-md`: 16px
- `--space-lg`: 24px
- `--space-xl`: 32px
- `--space-2xl`: 48px

## ტიპოგრაფია

- გვერდის მთავარი სათაური: 30–36px, font-weight 700–800.
- სექციის სათაური: 20–24px, font-weight 700.
- ბარათის სათაური: 15–17px, font-weight 700.
- ძირითადი ტექსტი: 14–16px; დამხმარე ტექსტი: 12–13px.

## Layout

- Desktop (1440px): 260px Sidebar + `minmax(0, 1fr)` content.
- Tablet (768px): sidebar overlay/drawer; ბარათები ორ სვეტად.
- Mobile (375px): ერთსვეტიანი ბარათები, hamburger menu და ვერტიკალური ფორმები.
- Grid: `repeat(auto-fit, minmax(220px, 1fr))`.
- Motion: card hover `transform: translateY(...)` + `opacity`; `prefers-reduced-motion` მხარდაჭერა.

მთავარი CSS წყაროა `src/styles/globals.css`. თუ დიზაინი იცვლება, განაახლე აქ მოცემული HEX და breakpoints ამ ფაილთან ერთად.
