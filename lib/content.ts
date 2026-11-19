export const categories = [
  { id: 'news', label: 'News', description: 'El fin de semana, contado por HUNDRA.', group: 'news' },
  { id: 'quedadas', label: 'Quedadas', description: 'Nos encontramos dentro del campo.', group: 'agenda' },
  { id: 'torneos', label: 'Torneos', description: 'Experiencias que se quedan para siempre.', group: 'agenda' },
  { id: 'charlas', label: 'Charlas', description: 'Herramientas para crecer dentro y fuera del campo.', group: 'agenda' },
  { id: 'semana', label: 'Jugador de la semana', description: 'El esfuerzo también merece su momento.', group: 'community' },
  { id: 'mes', label: 'Jugador del mes', description: 'Un mes para recordar. Un reconocimiento especial.', group: 'community' },
  { id: 'nuevo', label: 'Novedades HUNDRA', description: 'Todo lo que estamos construyendo para vosotros.', group: 'community' },
  { id: 'calendario', label: 'Calendario anual', description: 'El año de HUNDRA, en un solo lugar.', group: 'agenda' },
] as const;
export type Category = typeof categories[number]['id'];
export type Post = { id: string; category: Category; title: string; summary: string; body: string; image: string; published: boolean; date: string; endDate: string; location: string; url: string; player: string; featured: boolean; allDay: boolean; registrationOpen: boolean; updatedAt: string };
export type Settings = { welcome: string; introduction: string; whatsapp: string; contactEmail: string; coverImage?: string };
export type Content = { settings: Settings; posts: Post[] };
export const initialContent: Content = { settings: { welcome: 'Tu comunidad. Tu equipo.', introduction: 'Un lugar para estar cerca. Las historias de nuestros jugadores, los próximos encuentros y todo lo que nos hace HUNDRA.', whatsapp: '', contactEmail: '' }, posts: [] };
export const isEvent = (category: string) => ['quedadas', 'torneos', 'charlas', 'calendario'].includes(category);
export const dateLabel = (value: string) => value ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' }).format(new Date(value)) : '';
export function safeURL(value: string) { if (!value) return ''; try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } }
