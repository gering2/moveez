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
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${key}&language=en-US&append_to_response=credits`
  // details change less frequently; use a longer default ttl if not provided
  const localOpts = { ttl: opts.ttl ?? (1000 * 60 * 10), force: !!opts.force }
  return requestUrl(url, localOpts)
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
