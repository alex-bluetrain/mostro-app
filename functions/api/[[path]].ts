// Cloudflare Pages Function: reverse-proxies /api/* to mostro-server so the
// browser talks to one origin and the session cookie is first-party (Safari
// and Firefox block third-party cookies). Stores nothing.
//
// MOSTRO_UPSTREAM_URL (Pages env var, e.g. https://api.example.com) is the
// real server. The response body is passed through untouched, so SSE chat
// streams keep streaming — never buffer it (no `await res.text()`).

type Env = { MOSTRO_UPSTREAM_URL: string };

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const upstream = new URL(env.MOSTRO_UPSTREAM_URL);
  upstream.pathname = url.pathname.replace(/^\/api/, '') || '/';
  upstream.search = url.search;

  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') ?? '');

  try {
    const res = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual',
    });
    return new Response(res.body, res);
  } catch {
    return new Response('Bad Gateway', { status: 502 });
  }
};
