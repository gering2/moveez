import React, { useEffect, useState } from 'react'
import MovieList from './components/MovieList'
import MovieRow from './components/MovieRow'
import MovieDetailsModal from './components/MovieDetailsModal'
import { Container, Grid, Title, Paper, Stack, Button, Center, Loader, Text, TextInput, Group } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getPopular, getTopRated, getTrending, searchMovies } from './api/tmdb'

export default function App() {
  const TMDB_KEY = import.meta.env.VITE_TMDB_KEY
  const [movies, setMovies] = useState([])
  const [lists, setLists] = useState(() => {
    try { return JSON.parse(localStorage.getItem('movie_lists') || '[]') } catch { return [] }
  })
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('movie_ratings') || '{}') } catch { return {} }
  })

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [topRatedPage, setTopRatedPage] = useState(1)
  const [trendingPage, setTrendingPage] = useState(1)
  const [loadingTopRated, setLoadingTopRated] = useState(false)
  const [loadingTrending, setLoadingTrending] = useState(false)
  const [topRatedHasMore, setTopRatedHasMore] = useState(false)
  const [trendingHasMore, setTrendingHasMore] = useState(false)
  const [popularTotalPages, setPopularTotalPages] = useState(1)
  const [topRated, setTopRated] = useState([])
  const [trending, setTrending] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function handleSearchSubmit(query) {
    if (!query || !query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }
  

  useEffect(() => { localStorage.setItem('movie_lists', JSON.stringify(lists)) }, [lists])
  useEffect(() => { localStorage.setItem('movie_ratings', JSON.stringify(ratings)) }, [ratings])

  // Debounced autocomplete for toolbar search
  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSuggestions([])
      setLoadingSuggestions(false)
      return
    }

    setLoadingSuggestions(true)
    const t = setTimeout(async () => {
      try {
        const json = await searchMovies(search.trim(), 1)
        const mapped = mapResults(json.results || []).slice(0, 8)
        setSuggestions(mapped)
        setShowSuggestions(true)
      } catch (err) {
        console.warn('Autocomplete search failed', err)
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(t)
  }, [search])

  const addList = (list) => setLists(prev => [...prev, { ...list, id: Date.now() }])
  const addToList = (listId, movieId) => setLists(prev => prev.map(l => l.id === listId ? { ...l, movies: Array.from(new Set([...(l.movies||[]), movieId])) } : l))
  const setMovieRating = (movieId, score) => setRatings(prev => ({ ...prev, [movieId]: score }))

  useEffect(() => {
    if (!TMDB_KEY) {
      setError('TMDB API key not set (set VITE_TMDB_KEY in .env)')
      return
    }
    loadPage(1)
    loadTopRated()
    loadTrending()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function mapResults(results) {
    return (results||[]).map(m => ({
      id: m.id,
      title: m.title,
      year: m.release_date ? new Date(m.release_date).getFullYear() : '',
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Image',
      overview: m.overview || '',
      reviews: []
    }))
  }

  async function loadPage(p = 1) {
    if (!TMDB_KEY) {
      setError('TMDB API key not set')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const json = await getPopular(p)
      const mapped = mapResults(json.results)
      setMovies(prev => p === 1 ? mapped : [...prev, ...mapped])
      setPage(p)
      setHasMore(p < (json.total_pages || 1))
      setPopularTotalPages(json.total_pages || 1)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  async function loadTopRated(p = 1) {
    setLoadingTopRated(true)
    try {
      const json = await getTopRated(p)
      const mapped = mapResults(json.results)
      setTopRated(prev => p === 1 ? mapped : [...prev, ...mapped])
      setTopRatedPage(p)
      setTopRatedHasMore(p < (json.total_pages || 1))
    } catch (err) {
      console.warn('Failed loading top rated', err)
    } finally {
      setLoadingTopRated(false)
    }
  }

  async function loadTrending(period = 'day') {
    setLoadingTrending(true)
    try {
      const json = await getTrending(period, /* page */ 1)
      // TMDB trending endpoint may not support page param depending on wrapper; assume returning single page
      setTrending(mapResults(json.results))
      setTrendingPage(1)
      setTrendingHasMore(false)
    } catch (err) {
      console.warn('Failed loading trending', err)
    } finally {
      setLoadingTrending(false)
    }
  }

  async function handleLoadMoreAndScroll() {
    if (!hasMore || loading) return
    const container = document.getElementById('row-popular')
    const before = movies.length
    try {
      await loadPage(page + 1)
      // wait for DOM update then scroll the first newly loaded item into view
      requestAnimationFrame(() => {
        const items = container?.querySelectorAll('.movie-row-item')
        const el = items?.[before]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      })
    } catch (err) {
      console.warn('Load more failed', err)
    }
  }

  async function handleLoadMoreTopRated() {
    if (!topRatedHasMore || loadingTopRated) return
    try {
      await loadTopRated(topRatedPage + 1)
    } catch (err) {
      console.warn('Load more top rated failed', err)
    }
  }

  async function handleLoadMoreTrending() {
    if (!trendingHasMore || loadingTrending) return
    try {
      // If trending pagination supported, implement similarly. For now, no-op or future support.
      await loadTrending('day')
    } catch (err) {
      console.warn('Load more trending failed', err)
    }
  }

  return (
    <Container size="xl" py="md">
      <Stack spacing="sm">
        <Title order={1} style={{color:"var(--accent)",margin:"2% 3 %" }}>moveez</Title>
        <Paper padding="md">
          <div className="toolbar" style={{justifyContent: 'right', display:'flex'}}>
            {error &&   <div style={{display:'flex',alignItems:'center',gap:8}}>
              <Text color="red">Error loading from TMDB: {error}</Text>
            </div>}
              <div style={{position:'relative'}}>
              
                <TextInput
                  className="toolbar-search"
                  placeholder="Search movies..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(search) }}
                  onFocus={() => { if (suggestions.length) setShowSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  rightSection={<IconSearch size={16} />}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="toolbar-autocomplete" role="listbox">
                    {suggestions.map(s => (
                      <div key={s.id} className="toolbar-autocomplete-item" onMouseDown={() => { handleSearchSubmit(s.title); setShowSuggestions(false) }}>
                        <img src={s.poster} alt="" className="toolbar-autocomplete-poster" />
                        <div className="toolbar-autocomplete-meta">
                          <div className="toolbar-autocomplete-title">{s.title}</div>
                          <div className="toolbar-autocomplete-year">{s.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
           
          </div>

          <MovieRow title="Trending" movies={trending} onOpenDetails={(id) => navigate(`/movie/${id}`, { state: { background: location } })} onLoadMore={handleLoadMoreTrending} loading={loadingTrending} hasMore={trendingHasMore} />
          <MovieRow title="Top Rated" movies={topRated} onOpenDetails={(id) => navigate(`/movie/${id}`, { state: { background: location } })} onLoadMore={handleLoadMoreTopRated} loading={loadingTopRated} hasMore={topRatedHasMore} />
          <MovieRow id="row-popular" title="Popular" movies={movies} onOpenDetails={(id) => navigate(`/movie/${id}`, { state: { background: location } })} onLoadMore={handleLoadMoreAndScroll} loading={loading} hasMore={hasMore} />

          <div className="toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {!TMDB_KEY ? (
              <Text color="red">TMDB API key not set — add VITE_TMDB_KEY to .env</Text>
            ) : (
              <>
                <Text className="toolbar-note">Showing {movies.length} movies — page {page}/{popularTotalPages}</Text>
              </>
            )}
          </div>

          {/* Movie details handled via modal route in router */}
        </Paper>
      </Stack>
    </Container>
  )
}
