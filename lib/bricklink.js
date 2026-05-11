import crypto from 'crypto';

const BASE_URL = 'https://api.bricklink.com/api/store/v1';

function percentEncode(str) {
  return encodeURIComponent(String(str))
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function buildAuthHeader(method, baseUrl, queryParams) {
  const consumerKey = process.env.BRICKLINK_CONSUMER_KEY;
  const consumerSecret = process.env.BRICKLINK_CONSUMER_SECRET;
  const token = process.env.BRICKLINK_TOKEN;
  const tokenSecret = process.env.BRICKLINK_TOKEN_SECRET;

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: token,
    oauth_version: '1.0',
  };

  // Signature base includes both OAuth params and request query params
  const allParams = { ...queryParams, ...oauthParams };
  const paramString = Object.keys(allParams)
    .sort()
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    percentEncode(baseUrl),
    percentEncode(paramString),
  ].join('&');

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  const headerParams = { ...oauthParams, oauth_signature: signature };
  return (
    'OAuth ' +
    Object.entries(headerParams)
      .map(([k, v]) => `${k}="${percentEncode(v)}"`)
      .join(', ')
  );
}

export async function blFetch(path, queryParams = {}) {
  const baseUrl = `${BASE_URL}${path}`;
  const qs = new URLSearchParams(queryParams).toString();
  const fullUrl = qs ? `${baseUrl}?${qs}` : baseUrl;
  const authHeader = buildAuthHeader('GET', baseUrl, queryParams);

  const res = await fetch(fullUrl, {
    headers: { Authorization: authHeader },
    next: { revalidate: 60 },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.meta?.message || `HTTP ${res.status}`);
  }

  return json.data ?? json;
}
