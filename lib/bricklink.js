import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

const BASE_URL = 'https://api.bricklink.com/api/store/v1';

const oauth = new OAuth({
  consumer: {
    key: process.env.BRICKLINK_CONSUMER_KEY,
    secret: process.env.BRICKLINK_CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

export async function blFetch(endpoint, queryParams = {}) {
  const token = {
    key: process.env.BRICKLINK_TOKEN,
    secret: process.env.BRICKLINK_TOKEN_SECRET,
  };

  const baseUrl = `${BASE_URL}${endpoint}`;
  const qs = new URLSearchParams(queryParams).toString();
  const fullUrl = qs ? `${baseUrl}?${qs}` : baseUrl;

  const requestData = { url: fullUrl, method: 'GET' };
  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

  const res = await fetch(fullUrl, {
    headers: { ...authHeader },
    next: { revalidate: 60 },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.meta?.message || `HTTP ${res.status}`);
  }

  return json.data ?? json;
}
