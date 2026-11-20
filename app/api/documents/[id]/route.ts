import { authorized, readContent, runtime } from '@/lib/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]+\.pdf$/.test(id)) return new Response('No encontrado', { status: 404 });
  if (!await authorized(req)) {
    const { data } = await readContent();
    if (!data.posts.some(p => p.published && p.category === 'torneos' && p.attachments?.some(d => d.url === `/api/documents/${id}`))) return new Response('No encontrado', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  const object = await runtime().BUCKET.get(`documents/${id}`);
  if (!object) return new Response('No encontrado', { status: 404 });
  return new Response(object.body, { headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="documento-torneo.pdf"',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "sandbox; default-src 'none'; frame-ancestors 'self'",
  } });
}
