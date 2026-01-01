const DEFAULT_TTL = 1000 * 60 * 5 // 5 minutes
const cache = new Map()

async function requestUrl(url, { ttl = DEFAULT_TTL, force = false } = {}) {
  if (!force && cache.has(url)) {
    const entry = cache.get(url)
    if (Date.now() < entry.expires) return entry.data
    cache.delete(url)
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB error ${res.status}`)
  const json = await res.json()
  cache.set(url, { expires: Date.now() + ttl, data: json })
  return json
}

function clearCache() { cache.clear() }

export { DEFAULT_TTL, requestUrl, clearCache }
