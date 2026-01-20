import { requestUrl, clearCache, DEFAULT_TTL } from './cache'

function ensureKey() {
  const key = import.meta.env.VITE_TMDB_KEY
  if (!key) throw new Error('TMDB key not set')
  return key
}

export async function getPopular(page = 1, opts = {}) {
  const key = ensureKey()
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=en-US&page=${page}`
  return requestUrl(url, opts)
}

export async function getMovieDetails(id, opts = {}) {
  const key = ensureKey()
  // include external_ids so callers can read imdb_id without an extra request
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${key}&language=en-US&append_to_response=credits,external_ids`
  // details change less frequently; use a longer default ttl if not provided
  const localOpts = { ttl: opts.ttl ?? (1000 * 60 * 10), force: !!opts.force }
  return requestUrl(url, localOpts)
}

/**
 * Fetch external IDs for a movie (contains `imdb_id` when available)
 */
export async function getMovieExternalIds(id, opts = {}) {
  if (!id) throw new Error('movie id required')
  const key = ensureKey()
  const localOpts = { ttl: opts.ttl ?? (1000 * 60 * 60 * 24), force: !!opts.force }
  const url = `https://api.themoviedb.org/3/movie/${id}/external_ids?api_key=${key}`
  const json = await requestUrl(url, localOpts)
  return json || {}
}

export async function getTopRated(page = 1, opts = {}) {
  const key = ensureKey()
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&language=en-US&page=${page}`
  return requestUrl(url, opts)
}

export async function getTrending(period = 'day', opts = {}) {
  const key = ensureKey()
  const url = `https://api.themoviedb.org/3/trending/movie/${period}?api_key=${key}`
  return requestUrl(url, opts)
}

export async function searchMovies(query, page = 1, opts = {}) {
  const key = ensureKey()
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`
  // search results are volatile; default to a short TTL (5 minutes) unless caller overrides
  const localOpts = { ttl: opts.ttl ?? DEFAULT_TTL, force: !!opts.force }
  return requestUrl(url, localOpts)
}

// In-flight dedupe map for provider calls
const _providersPending = new Map()

/**
 * Fetch watch/provider data for a movie (TMDB's /movie/{id}/watch/providers)
 * Returns the full results object. If `country` is provided, the caller will
 * typically read results[country] for per-country info.
 * Uses a longer TTL (12 hours) by default and dedupes concurrent calls for same id.
 */
export async function getMovieProviders(id, country, opts = {}) {
  if (!id) throw new Error('movie id required')
  const key = ensureKey()
  const url = `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${key}`

  // if there's already a pending request for this id, return the same promise
  if (_providersPending.has(id)) return _providersPending.get(id)

  const localOpts = { ttl: opts.ttl ?? (1000 * 60 * 60 * 12), force: !!opts.force }
  const p = (async () => {
    try {
      const json = await requestUrl(url, localOpts)
      return json && json.results ? json.results : {}
    } finally {
      _providersPending.delete(id)
    }
  })()

  _providersPending.set(id, p)
  return p
}

/**
 * Fetch the full list of streaming providers from TMDB (/watch/providers/providers)
 * Returns an array of provider objects. Cache for 24 hours by default.
 */
export async function getProvidersList(opts = {}) {
  const key = ensureKey()
  const localOpts = { ttl: opts.ttl ?? (1000 * 60 * 60 * 24), force: !!opts.force }
  const urlWithLang = `https://api.themoviedb.org/3/watch/providers/providers?api_key=${key}&language=en-US`
  try {
    const json = await requestUrl(urlWithLang, localOpts)
    return json && json.results ? json.results : []
  } catch (err) {
    // If TMDB returns a 400 for the language variant, try without the language param as a fallback.
    console.warn('getProvidersList failed, retrying without language param', err)
    const urlFallback = `https://api.themoviedb.org/3/watch/providers/providers?api_key=${key}`
    try {
      const json2 = await requestUrl(urlFallback, localOpts)
      return json2 && json2.results ? json2.results : []
    } catch (err2) {
      throw err2
    }
  }
}

/**
 * Discover movies available on a specific provider id (TMDB provider id).
 * Uses `/discover/movie` with `with_watch_providers` and `watch_region`.
 * Caches results per request URL (default TTL 1 hour).
 */
export async function getMoviesByProvider(providerId, region = 'US', page = 1, opts = {}) {
  if (!providerId) throw new Error('providerId required')
  const key = ensureKey()
  const localOpts = { ttl: opts.ttl ?? (1000 * 60 * 60), force: !!opts.force }
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_watch_providers=${providerId}&watch_region=${encodeURIComponent(region)}&sort_by=popularity.desc&page=${page}`
  const json = await requestUrl(url, localOpts)
  return json
}
