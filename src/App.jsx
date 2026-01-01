import React, { useEffect, useState } from 'react'
import MovieList from './components/MovieList'
import MovieRow from './components/MovieRow'
import MovieDetailsModal from './components/MovieDetailsModal'
import { Container, Grid, Title, Paper, Stack, Button, Center, Loader, Text } from '@mantine/core'
import { getPopular, getTopRated, getTrending } from './api/tmdb'

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
  const [popularTotalPages, setPopularTotalPages] = useState(1)
  const [topRated, setTopRated] = useState([])
  const [trending, setTrending] = useState([])
  const [error, setError] = useState(null)
  const [detailsId, setDetailsId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => { localStorage.setItem('movie_lists', JSON.stringify(lists)) }, [lists])
  useEffect(() => { localStorage.setItem('movie_ratings', JSON.stringify(ratings)) }, [ratings])

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
    try {
      const json = await getTopRated(p)
      setTopRated(mapResults(json.results))
    } catch (err) {
      console.warn('Failed loading top rated', err)
    }
  }

  async function loadTrending(period = 'day') {
    try {
      const json = await getTrending(period)
      setTrending(mapResults(json.results))
    } catch (err) {
      console.warn('Failed loading trending', err)
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

  return (
    <Container size="xl" py="md">
      <Stack spacing="sm">
        <Title order={1}>moveez</Title>
        <Paper padding="md">
          <div className="toolbar">
            <Title order={2} size="h3">All Movies</Title>
            {error && <Text color="red">Error loading from TMDB: {error}</Text>}
          </div>

          <MovieRow title="Trending" movies={trending} onOpenDetails={(id) => { setDetailsId(id); setDetailsOpen(true) }} />
          <MovieRow title="Top Rated" movies={topRated} onOpenDetails={(id) => { setDetailsId(id); setDetailsOpen(true) }} />
          <MovieRow id="row-popular" title="Popular" movies={movies} onOpenDetails={(id) => { setDetailsId(id); setDetailsOpen(true) }} onLoadMore={handleLoadMoreAndScroll} loading={loading} hasMore={hasMore} />

          <div className="toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {!TMDB_KEY ? (
              <Text color="red">TMDB API key not set — add VITE_TMDB_KEY to .env</Text>
            ) : (
              <>
                <Text className="toolbar-note">Showing {movies.length} movies — page {page}/{popularTotalPages}</Text>
                <div>
                  {loading ? <Loader /> : hasMore ? <Button onClick={() => loadPage(page + 1)} disabled={loading}>Load more</Button> : <Text color="dimmed">No more movies</Text>}
                </div>
              </>
            )}
          </div>

          <MovieDetailsModal id={detailsId} opened={detailsOpen} onClose={() => setDetailsOpen(false)} />
        </Paper>
      </Stack>
    </Container>
  )
}
