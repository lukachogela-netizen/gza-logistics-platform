import { ArrowLeft, MapPinned } from 'lucide-react';

export function NotFoundPage() {
  return <main className="page-content"><section className="empty-state empty-state--large"><span className="empty-state__icon"><MapPinned size={28} /></span><p className="eyebrow">404 · გვერდი ვერ მოიძებნა</p><h1>ეს მარშრუტი არ არსებობს</h1><p>მისამართი შეიძლება შეცვლილი ან წაშლილი იყოს.</p><a className="button button--primary" href="/"><ArrowLeft size={16} /> მთავარ გვერდზე დაბრუნება</a></section></main>;
}
