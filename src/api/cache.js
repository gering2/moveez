const DEFAULT_TTL = 1000 * 60 * 5 // 5 minutes
const cache = new Map()

async function requestUrl(url, { ttl = DEFAULT_TTL, force = false } = {}) {
  if (!force && cache.has(url)) {
    const entry = cache.get(url)
    if (Date.now() < entry.expires) return entry.data
    cache.delete(url)
  }

  const res = await fetch(url)
  if (!res.ok) {
    let bodyText = res.statusText
    try {
      const jsonErr = await res.json()
      bodyText = jsonErr?.status_message || JSON.stringify(jsonErr)
    } catch (e) {
      try { bodyText = await res.text() } catch (e2) { /* ignore */ }
    }
    throw new Error(`TMDB error ${res.status}: ${bodyText}`)
  }
  const json = await res.json()
  cache.set(url, { expires: Date.now() + ttl, data: json })
  return json
}

function clearCache() { cache.clear() }

export { DEFAULT_TTL, requestUrl, clearCache }
