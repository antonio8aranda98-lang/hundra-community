import { MessageCircle } from 'lucide-react';
import type { Post } from '@/lib/content';
import { whatsappMessage } from '@/lib/whatsapp';

export default function GroupWhatsAppNotice({ post }: { post: Pick<Post, 'category' | 'title'> }) {
  const message = whatsappMessage(post);
  if (!message) return null;
  return (
    <div className="group-whatsapp-notice">
      <MessageCircle size={22} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
