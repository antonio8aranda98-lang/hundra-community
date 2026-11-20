'use client';
import { useId, useState } from 'react';
import { FilePlus2, FileText, X } from 'lucide-react';
import type { Attachment } from '@/lib/content';

export default function TournamentDocumentsEditor({ documents, onChange, busy, setBusy, setMessage }: {
  documents: Attachment[];
  onChange: (documents: Attachment[]) => void;
  busy: boolean;
  setBusy: (busy: boolean) => void;
  setMessage: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ text: string; error: boolean } | null>(null);
  const inputId = useId();
  return (
    <section className="tournament-documents-editor" aria-labelledby="tournament-documents-title">
      <div><h2 id="tournament-documents-title">Documentos del torneo</h2><p>Añade el dossier, las condiciones o la información del viaje. Las familias podrán abrir cada PDF desde el torneo.</p></div>
      {documents.map((document, i) => <div className="document-editor-row" key={document.url}>
        <FileText size={22} aria-hidden="true" />
        <label>Nombre del documento<input required maxLength={180} value={document.name} onChange={e => onChange(documents.map((d, j) => j === i ? { ...d, name: e.target.value } : d))} /></label>
        <a href={document.url} target="_blank" rel="noopener noreferrer" className="button outline-dark">Ver PDF</a>
        <button type="button" className="button outline-dark" aria-label={`Quitar ${document.name}`} disabled={busy} onClick={() => onChange(documents.filter((_, j) => j !== i))}><X size={17} /></button>
      </div>)}
      <div className="pdf-upload-control">
        <label htmlFor={inputId} className="pdf-upload-label"><FilePlus2 size={18} aria-hidden="true" />Adjuntar PDF</label>
        <input id={inputId} className="pdf-file-input" aria-label="Adjuntar PDF del torneo" aria-describedby={`${inputId}-help`} type="file" accept="application/pdf,.pdf" disabled={busy || documents.length >= 10} onChange={async e => {
          const input = e.currentTarget, file = input.files?.[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024) { const text = 'El PDF debe ocupar como máximo 10 MB.'; setMessage(text); setUploadStatus({ text, error: true }); input.value = ''; return; }
          setBusy(true); setUploading(true); setMessage(''); setUploadStatus(null);
          try {
            const response = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/pdf' }, body: file });
            const result = await response.json().catch(() => ({ error: 'No se ha podido subir el PDF. Inténtalo de nuevo.' })) as { url?: string; error?: string };
            if (!response.ok || !result.url) throw new Error(result.error || 'No se ha podido subir el PDF.');
            onChange([...documents, { name: file.name.replace(/\.pdf$/i, '').slice(0, 180) || 'Documento del torneo', url: result.url }]);
            const text = `PDF adjuntado: ${file.name}. Guarda el torneo para conservarlo.`;
            setMessage(text); setUploadStatus({ text, error: false });
          } catch (error) { const text = error instanceof Error ? error.message : 'No se ha podido subir el PDF.'; setMessage(text); setUploadStatus({ text, error: true }); }
          finally { setBusy(false); setUploading(false); input.value = ''; }
        }} />
      </div>
      {uploading && <p className="pdf-upload-status" role="status">Subiendo PDF…</p>}
      {uploadStatus && <p className={`pdf-upload-status${uploadStatus.error ? ' is-error' : ''}`} role={uploadStatus.error ? 'alert' : 'status'}>{uploadStatus.text}</p>}
      {documents.length >= 10 && <p className="pdf-upload-status" role="status">Has alcanzado los 10 PDF de este torneo. Quita uno antes de adjuntar otro.</p>}
      <small id={`${inputId}-help`}>Solo PDF. Máximo 10 MB por archivo y 10 documentos por torneo. Se mostrarán a las familias cuando publiques el torneo. Quitar un documento lo desvincula del torneo al guardar.</small>
    </section>
  );
}
