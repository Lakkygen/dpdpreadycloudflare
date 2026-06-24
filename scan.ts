interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    const { url } = await context.request.json() as { url: string };
    // In production, you would run a real scan here.
    // For now, we return a realistic demo response.
    const score = Math.floor(Math.random() * 30) + 50; // 50–79
    return new Response(JSON.stringify({
      score,
      gaps: [
        { title: 'Missing consent notice', severity: 'high' },
        { title: 'Privacy policy outdated', severity: 'medium' },
        { title: 'Third‑party scripts without consent', severity: 'high' }
      ],
      summary: 'Your website needs a proper consent banner and an updated privacy policy.'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
};
