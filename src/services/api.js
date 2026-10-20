const API_URL = import.meta.env.VITE_API_URL;

async function readJson(response, requestUrl) {
  const body = await response.text();
  if (!response.ok) {
    const detail = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
    const suffix = detail ? ` Respons: ${detail}` : '';
    throw new Error(`HTTP ${response.status} (${response.statusText || 'tiada status text'}) untuk ${requestUrl}.${suffix}`);
  }
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`Respons API bukan JSON yang sah untuk ${requestUrl}.`);
  }
  if (data?.success === false || data?.ok === false) {
    throw new Error(data.message || data.error || 'Permintaan API gagal.');
  }
  return data;
}

export async function fetchBootstrapData() {
  if (!API_URL) throw new Error('VITE_API_URL belum ditetapkan.');
  const response = await fetch(`${API_URL}?action=bootstrap`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  return readJson(response, `${API_URL}?action=bootstrap`);
}

async function post(payload) {
  if (!API_URL) throw new Error('VITE_API_URL belum ditetapkan.');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return readJson(response, API_URL);
}

export function postUpdateScript(record) {
  return post({ action: 'updateScript', record });
}

export function saveBatchDrafts(items) {
  return post({ action: 'saveBatchDrafts', items });
}
