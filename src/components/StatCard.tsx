import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon: LucideIcon;
  tone: 'teal' | 'blue' | 'amber' | 'violet';
}

export function StatCard({ label, value, detail, trend, trendDirection = 'up', icon: Icon, tone }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}><Icon size={20} strokeWidth={1.9} /></div>
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <div className="stat-card__main"><strong>{value}</strong>{trend && <span className={`stat-card__trend stat-card__trend--${trendDirection}`}>{trendDirection === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{trend}</span>}</div>
        <p className="stat-card__detail">{detail}</p>
      </div>
    </article>
  );
}
