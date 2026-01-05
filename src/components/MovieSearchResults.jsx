import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Container, Title, Loader, Text, Button, Group, ActionIcon } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import { searchMovies } from '../api/tmdb'
import MovieList from './MovieList'

export default function MovieSearchResults() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!q) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const json = await searchMovies(q, 1)
        if (!cancelled) setResults((json.results || []).map(m => ({
          id: m.id,
          title: m.title,
          year: m.release_date ? new Date(m.release_date).getFullYear() : '',
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Image',
          overview: m.overview || '',
        })))
      } catch (err) {
        if (!cancelled) setError(String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [q])

  return (
    <Container size="xl" py="md">
      <Group position="apart" align="center" style={{ marginBottom: 12 }}>
        <ActionIcon variant="light" size="lg" onClick={() => navigate('/')} aria-label="Back to home">
          <IconChevronLeft size={20} />
        </ActionIcon>
        <Title order={2}>Search results for "{q}"</Title>
      </Group>
      {loading && <Loader />}
      {error && <Text color="red">{error}</Text>}
      {!loading && !error && results.length === 0 && <Text color="dimmed">No results</Text>}
      {!loading && !error && results.length > 0 && (
        <MovieList movies={results} />
      )}
    </Container>
  )
}
