import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ref = url.searchParams.get('ref');
  if (ref) {
    const cookie = `ref=${ref}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
    return new Response('OK', {
      headers: { 'Set-Cookie': cookie }
    });
  }
  return new Response('OK');
}
