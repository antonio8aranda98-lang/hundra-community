import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const base = 'http://127.0.0.1:5173'; // Deliberately local: this test publishes fictitious content.
const line = readFileSync('.dev.vars', 'utf8').split('\n').find(s => s.startsWith('ADMIN_PASSWORD='));
const raw = line?.slice('ADMIN_PASSWORD='.length).trim();
assert(raw, 'Configure the local admin password.');
const password = raw.startsWith('"') ? JSON.parse(raw) : raw.replace(/^'|'$/g, '');
const login = await fetch(base + '/api/session', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
assert.equal(login.status, 200);
const cookie = login.headers.get('set-cookie').split(';')[0];
const auth = { Origin: base, Cookie: cookie };
const original = await fetch(base + '/api/content', { headers: auth }).then(r => r.json());
let revision = original.revision;
const content = { settings: original.settings, posts: original.posts };
async function save(data, expected = 200) {
  const r = await fetch(base + '/api/content', { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, _revision: revision }) });
  const result = await r.json();
  assert.equal(r.status, expected, result.error);
  if (r.ok) revision = result.revision;
}
// A real one-page PDF with cross-reference offsets, used by the UI check too.
let pdf = '%PDF-1.4\n';
const stream = 'BT /F1 18 Tf 50 740 Td (PDF DE PRUEBA LOCAL - HUNDRA) Tj ET';
const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
const offsets = [0];
objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
const start = Buffer.byteLength(pdf);
pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
mkdirSync('work', { recursive: true }); writeFileSync('work/test-tournament.pdf', pdf);
const upload = (body, headers = auth, type = 'application/pdf') => fetch(base + '/api/documents', { method: 'POST', headers: { ...headers, 'Content-Type': type }, body });
let touched = false;
try {
  assert.equal((await upload(pdf, { Origin: base })).status, 403);
  assert.equal((await upload(pdf, { ...auth, Origin: 'https://other.invalid' })).status, 403);
  assert.equal((await upload('<html>not a PDF</html>')).status, 400);
  assert.equal((await upload(pdf, auth, 'text/html')).status, 400);
  assert.equal((await upload(Buffer.alloc(10 * 1024 * 1024 + 1))).status, 413);
  const uploaded = await upload(pdf); assert.equal(uploaded.status, 200);
  const { url } = await uploaded.json();
  assert.equal((await fetch(base + url)).status, 404, 'Unattached PDF must not be public.');
  assert.equal((await fetch(base + url, { headers: auth })).status, 200);
  const post = { id: crypto.randomUUID(), category: 'torneos', title: 'Prueba PDF solo local', summary: '', body: 'Documento ficticio de prueba.', image: '', published: false, date: '2027-06-24', endDate: '', location: '', url: '', player: '', featured: false, allDay: true, registrationOpen: false, updatedAt: new Date().toISOString(), attachments: [{ name: 'Dossier de prueba', url }] };
  const next = { ...content, posts: [...content.posts, post] };
  await save(next); touched = true;
  assert.equal((await fetch(base + url)).status, 404, 'Draft PDFs must stay private.');
  let publicData = await fetch(base + '/api/content').then(r => r.json());
  assert(!publicData.posts.some(p => p.id === post.id));
  await save({ ...next, posts: [...content.posts, { ...post, attachments: [{ name: 'External', url: 'https://example.invalid/file.pdf' }] }] }, 400);
  await save({ ...next, posts: [...content.posts, { ...post, attachments: [post.attachments[0], post.attachments[0]] }] }, 400);
  await save({ ...next, posts: [...content.posts, { ...post, category: 'news' }] }, 400);
  post.published = true; await save(next);
  const served = await fetch(base + url); assert.equal(served.status, 200);
  assert.equal(served.headers.get('content-type'), 'application/pdf');
  assert.match(served.headers.get('content-disposition'), /^inline/);
  assert.equal(await served.text(), pdf);
  publicData = await fetch(base + '/api/content').then(r => r.json());
  assert.deepEqual(publicData.posts.find(p => p.id === post.id).attachments, post.attachments);
  post.published = false; await save(next);
  assert.equal((await fetch(base + url)).status, 404, 'Unpublishing revokes PDF access.');
  console.log('PASS: PDF upload, authentication, origin, format/size limits, draft privacy, attachment validation, public PDF bytes and revocation.');
} finally {
  if (touched) {
    const latest = await fetch(base + '/api/content', { headers: auth }).then(r => r.json());
    revision = latest.revision; await save(content);
  }
  await fetch(base + '/api/session', { method: 'DELETE', headers: auth });
}
