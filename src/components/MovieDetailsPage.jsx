import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Title, Text, Group, Badge, Loader, Stack, ActionIcon, Skeleton } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import { getMovieDetails } from '../api/tmdb'

export default function MovieDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    const key = import.meta.env.VITE_TMDB_KEY
    if (!key) {
      setError('TMDB key not set')
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const json = await getMovieDetails(id)
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  return (
    <Container size="xl" py="md">
      <ActionIcon variant="light" size="lg" onClick={() => navigate(-1)} aria-label="Back">
        <IconChevronLeft size={20} />
      </ActionIcon>
      {loading && <Loader />}
      {error && <Text color="red">{error}</Text>}
      {data && (
        <Stack spacing="sm">
          <Group align="flex-start">
            <Skeleton visible={false} radius="6px">
              <img src={data.poster_path ? `https://image.tmdb.org/t/p/w300${data.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Image'} alt={data.title} loading="lazy" style={{width:150,height:'auto',display:'block',borderRadius:6}} />
            </Skeleton>
            <div>
              <Title order={4}>{data.title} ({data.release_date ? new Date(data.release_date).getFullYear() : ''})</Title>
              <Text size="sm" color="dimmed">Runtime: {data.runtime ? `${data.runtime} min` : 'N/A'}</Text>
              <div style={{ marginTop: 8 }}>
                {(data.genres||[]).map(g => <Badge key={g.id} mr={6}>{g.name}</Badge>)}
              </div>
              <Text mt="sm">{data.overview}</Text>
            </div>
          </Group>
          {data.credits && data.credits.cast && (
            <div>
              <Title order={5}>Top cast</Title>
              <Text size="sm">{(data.credits.cast||[]).slice(0,6).map(c => c.name).join(', ')}</Text>
            </div>
          )}
        </Stack>
      )}
    </Container>
  )
}
