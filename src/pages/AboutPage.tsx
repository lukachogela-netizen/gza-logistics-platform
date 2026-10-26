import { ArrowRight, BadgeCheck, Compass, HeartHandshake, ShieldCheck, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <main className="page-content">
      <section className="page-heading" aria-labelledby="about-heading">
        <div>
          <div className="breadcrumb"><span>სამუშაო სივრცე</span><span aria-hidden="true">/</span><strong>პლატფორმის შესახებ</strong></div>
          <p className="eyebrow">მარტივად გადაადგილება</p>
          <h1 id="about-heading">ერთი სივრცე. მეტი შესაძლებლობა.</h1>
          <p className="page-heading__description">„გზა“ აკავშირებს მგზავრებს, მძღოლებსა და კომპანიებს, რათა მარშრუტის დაგეგმვა უფრო მარტივი გახდეს.</p>
        </div>
      </section>

      <section className="about-hero" aria-label="პლატფორმის კონცეფცია">
        <div className="about-hero__copy"><span className="about-hero__kicker">ჩვენი მიზანი</span><h2>ტრანსპორტის მართვა — ზედმეტი სირთულეების გარეშე.</h2><p>მარშრუტების ძიება, ადგილების კონტროლი და ჯავშნების მართვა ერთ გასაგებ და მოქნილ ინტერფეისში.</p><a className="button button--light" href="/routes">მარშრუტების დათვალიერება <ArrowRight size={16} /></a></div>
        <figure className="about-hero__figure"><div className="route-illustration" aria-hidden="true"><span className="route-illustration__point route-illustration__point--a" /><span className="route-illustration__point route-illustration__point--b" /><span className="route-illustration__path" /><span className="route-illustration__vehicle"><Compass size={31} /></span></div><figcaption>საჩვენებელი ილუსტრაცია: მარშრუტის დაგეგმვის იდეა</figcaption></figure>
      </section>

      <section className="about-features" aria-labelledby="about-features-title"><div className="section-heading"><div><p className="eyebrow">როგორ ვეხმარებით</p><h2 id="about-features-title">შექმნილია რეალური ამოცანებისთვის</h2></div></div>
        <div className="feature-grid">
          <article className="feature-card"><span className="feature-card__icon feature-card__icon--teal"><Compass size={22} /></span><h3>მარტივი ძიება</h3><p>მოძებნე მიმართულება, შეადარე პირობები და გაფილტრე რეისები რამდენიმე მოქმედებით.</p></article>
          <article className="feature-card"><span className="feature-card__icon feature-card__icon--blue"><ShieldCheck size={22} /></span><h3>გამჭვირვალე ინფორმაცია</h3><p>იხილე ფასი, გამგზავრების დრო, მძღოლი და ხელმისაწვდომი ადგილები ერთ ბარათზე.</p></article>
          <article className="feature-card"><span className="feature-card__icon feature-card__icon--violet"><HeartHandshake size={22} /></span><h3>როლებზე მორგებული</h3><p>მგზავრს, მძღოლსა და კომპანიას სხვადასხვა საჭიროება აქვს — არქიტექტურაც ამას ითვალისწინებს.</p></article>
          <article className="feature-card"><span className="feature-card__icon feature-card__icon--amber"><Users size={22} /></span><h3>მოქნილი მართვა</h3><p>მარშრუტების დამატება, რედაქტირება და წაშლა შესაძლებელია გვერდის განახლების გარეშე.</p></article>
        </div>
      </section>
      <div className="about-note"><BadgeCheck size={18} /><p>ეს არის სასწავლო პროექტი: API-ის ჩართვისას მონაცემები SQLite-ში ინახება და მარშრუტის მართვა JWT/RBAC-ით კონტროლდება; ქსელის გათიშვისას UI იყენებს ამ ბრაუზერის cache/demo მონაცემებს. რეალური გადახდები ინტეგრირებული არ არის.</p></div>
    </main>
  );
}
