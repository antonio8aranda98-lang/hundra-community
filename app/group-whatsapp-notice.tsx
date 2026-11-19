import { MessageCircle } from 'lucide-react';

export default function GroupWhatsAppNotice() {
  return (
    <div className="group-whatsapp-notice">
      <MessageCircle size={22} aria-hidden="true" />
      <p>Avisadnos por el grupo de WhatsApp.</p>
    </div>
  );
}
