const cache = new Map()

async function fetchRatings(title, year) {
  if (!title) return null
  const key = `${title}::${year || ''}`.toLowerCase()
  if (cache.has(key)) {
    // eslint-disable-next-line no-console
    console.debug('OMDb:cache hit for title', title, year)
    return cache.get(key)
  }

  const apiKey = import.meta.env.VITE_OMDB_KEY
  if (!apiKey) {
    cache.set(key, null)
    return null
  }

  const params = new URLSearchParams({ t: title, apikey: apiKey })
  if (year) params.set('y', String(year))

  try {
    // eslint-disable-next-line no-console
    console.debug('OMDb:fetch by title', title, year, params.toString())
    const res = await fetch(`https://www.omdbapi.com/?${params.toString()}`)
    const json = await res.json()
    // eslint-disable-next-line no-console
    console.debug('OMDb:fetch by title response', title, json && json.Response)
    if (json && json.Response === 'True') {
      const out = {
        imdbRating: json.imdbRating !== 'N/A' ? json.imdbRating : null,
        imdbVotes: json.imdbVotes !== 'N/A' ? json.imdbVotes : null,
        metascore: json.Metascore && json.Metascore !== 'N/A' ? json.Metascore : null,
        imdbID: json.imdbID || null
      }
      cache.set(key, out)
      return out
    }
    // If direct title lookup failed, try a search-based fallback to locate an imdbID
    try {
      const searchParams = new URLSearchParams({ s: title, apikey: apiKey, type: 'movie' })
      if (year) searchParams.set('y', String(year))
      // eslint-disable-next-line no-console
      console.debug('OMDb:search fallback', title, year, searchParams.toString())
      const sres = await fetch(`https://www.omdbapi.com/?${searchParams.toString()}`)
      const sjson = await sres.json()
      // eslint-disable-next-line no-console
      console.debug('OMDb:search response', title, sjson && sjson.Response, sjson?.Search?.length)
      if (sjson && sjson.Response === 'True' && Array.isArray(sjson.Search) && sjson.Search.length > 0) {
        // prefer exact year match if available
        let candidate = null
        if (year) candidate = sjson.Search.find(it => (it.Year || '').includes(String(year)))
        if (!candidate) candidate = sjson.Search[0]
        if (candidate && candidate.imdbID) {
          // eslint-disable-next-line no-console
          console.debug('OMDb:search selected candidate', candidate.Title, candidate.Year, candidate.imdbID)
          const byId = await fetchByImdbID(candidate.imdbID)
          cache.set(key, byId)
          return byId
        }
      }
    } catch (errSearch) {
      // ignore search fallback errors
      // eslint-disable-next-line no-console
      console.debug('OMDb search fallback failed for', title, year, errSearch)
    }

    cache.set(key, null)
    return null
  } catch (err) {
    cache.set(key, null)
    return null
  }
}

async function fetchByImdbID(imdbID) {
  if (!imdbID) return null
  const key = `imdb::${imdbID}`.toLowerCase()
  if (cache.has(key)) return cache.get(key)

  const apiKey = import.meta.env.VITE_OMDB_KEY
  if (!apiKey) {
    cache.set(key, null)
    return null
  }

  const params = new URLSearchParams({ i: imdbID, apikey: apiKey })
  try {
    const res = await fetch(`https://www.omdbapi.com/?${params.toString()}`)
    const json = await res.json()
    if (json && json.Response === 'True') {
      const out = {
        imdbRating: json.imdbRating !== 'N/A' ? json.imdbRating : null,
        imdbVotes: json.imdbVotes !== 'N/A' ? json.imdbVotes : null,
        metascore: json.Metascore && json.Metascore !== 'N/A' ? json.Metascore : null,
        imdbID: json.imdbID || null
      }
      cache.set(key, out)
      return out
    }
    cache.set(key, null)
    return null
  } catch (err) {
    cache.set(key, null)
    return null
  }
}

export { fetchRatings, fetchByImdbID, cache }
