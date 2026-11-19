'use client';
import { CalendarDays, Newspaper, Trophy, Mic, MapPin, Sparkles } from 'lucide-react';
import GroupWhatsAppNotice from './group-whatsapp-notice';
import { categories, isEvent, dateLabel, type Post } from '@/lib/content';

export default function PostCard({ post: p }: { post: Post }) {
  const category = categories.find(c => c.id === p.category);
  return (
    <article className={`post-card category-${p.category}`} id={p.id}>
      <div className="post-header">
        <div className="post-category">
          <span className="category-icon">
            {['semana', 'mes'].includes(p.category) ? <Trophy size={17} /> : p.category === 'charlas' ? <Mic size={17} /> : isEvent(p.category) ? <CalendarDays size={17} /> : p.category === 'nuevo' ? <Sparkles size={17} /> : <Newspaper size={17} />}
          </span>
          <div>
            <span>{category?.label}</span>
            {p.date && <time dateTime={p.date}>{dateLabel(p.date)}{p.endDate && p.endDate !== p.date ? ` – ${dateLabel(p.endDate)}` : ''}</time>}
          </div>
        </div>
      </div>
      <div className="post-title">
        <h2>{p.title}</h2>
        {p.player && <p className="player-name">{p.player}</p>}
        {p.summary && <p className="post-summary">{p.summary}</p>}
      </div>
      {p.image && <div className="post-image"><img src={p.image} alt={`${category?.label}: ${p.player || p.title}`} loading="lazy" decoding="async" /></div>}
      <div className="post-content">
        {isEvent(p.category) && (p.location || p.date && !p.allDay) && <div className="event-meta">
          {p.location && <span><MapPin size={15} />{p.location}</span>}
          {p.date && !p.allDay && <span><CalendarDays size={15} />{new Date(p.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })} · Madrid</span>}
        </div>}
        <div className="post-body">{p.body.split(/\n\s*\n/).map((text, i) => {
          const lines = text.split('\n');
          const isName = p.category === 'news' && lines.length > 1 && lines[0].length < 65;
          return <p key={i}>{isName ? <><strong>{lines[0]}</strong><br />{lines.slice(1).join('\n')}</> : text}</p>;
        })}</div>
        {(isEvent(p.category) || p.category === 'mes') && <GroupWhatsAppNotice />}
      </div>
    </article>
  );
}
