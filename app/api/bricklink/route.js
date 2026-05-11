import { blFetch } from '@/lib/bricklink';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return Response.json({ error: 'Missing required parameter: endpoint' }, { status: 400 });
  }

  const queryParams = {};
  for (const [key, value] of searchParams.entries()) {
    if (key !== 'endpoint') queryParams[key] = value;
  }

  try {
    const data = await blFetch(endpoint, queryParams);
    return Response.json({ data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
