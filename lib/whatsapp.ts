import type { Post } from './content';

export function whatsappMessage(post: Pick<Post, 'category' | 'title'>): string {
  if (/^(gira|tour)\b/i.test(post.title)) return '';
  switch (post.category) {
    case 'torneos': return 'Avisadnos por WhatsApp si queréis venir.';
    case 'charlas': return 'Avisadnos por WhatsApp si queréis asistir.';
    case 'mes': return 'Reclama tu regalo por WhatsApp.';
    case 'quedadas': return 'Avisadnos por el grupo de WhatsApp.';
    default: return '';
  }
}
