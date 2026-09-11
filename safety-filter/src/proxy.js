import fetch from 'node-fetch';

export async function proxyRequest({ baseUrl, apiKey, body }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`LLM API error: ${response.status}`);
  return response.json();
}