import { authorized, json, runtime, sameOrigin } from '@/lib/server';

export async function POST(req: Request) {
  if (!sameOrigin(req) || !await authorized(req)) return json({ error: 'Inicia sesión para adjuntar documentos.' }, 403);
  if (req.headers.get('content-type')?.split(';')[0].trim() !== 'application/pdf') return json({ error: 'Solo se admiten documentos PDF.' }, 400);
  const max = 10 * 1024 * 1024;
  if (Number(req.headers.get('content-length')) > max) return json({ error: 'El PDF debe ocupar como máximo 10 MB.' }, 413);
  const reader = req.body?.getReader();
  if (!reader) return json({ error: 'Selecciona un PDF.' }, 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > max) { await reader.cancel(); return json({ error: 'El PDF debe ocupar como máximo 10 MB.' }, 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const decoder = new TextDecoder();
  if (!/^%PDF-\d\.\d/.test(decoder.decode(bytes.slice(0, 8))) || !decoder.decode(bytes.slice(-1024)).includes('%%EOF')) return json({ error: 'El archivo no es un PDF válido.' }, 400);
  const id = `${crypto.randomUUID()}.pdf`;
  await runtime().BUCKET.put(`documents/${id}`, bytes, { httpMetadata: { contentType: 'application/pdf' } });
  return json({ url: `/api/documents/${id}` });
}
