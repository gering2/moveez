import React from 'react'
import { Container, Title, Text, Button, Group, ActionIcon } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import MovieList from './MovieList'
import { getSeen, clearSeen } from '../utils/seen'
import { useNavigate } from 'react-router-dom'

export default function SeenPage() {
  const [items, setItems] = React.useState(getSeen())
  const navigate = useNavigate()

  function handleRemove(id) {
    // keep compatibility with previous UI; remove by clearing then resetting
    const list = getSeen().filter(i => i.id !== id)
    localStorage.setItem('seen_movies_v1', JSON.stringify(list))
    // dispatch event so other listeners update (seen.js also dispatches when using helpers)
    try { window.dispatchEvent(new CustomEvent('seen:change', { detail: list })) } catch (e) {}
    setItems(list)
  }

  React.useEffect(() => {
    function onChange() { setItems(getSeen()) }
    window.addEventListener('seen:change', onChange)
    return () => window.removeEventListener('seen:change', onChange)
  }, [])

  return (
    <Container size="xl" py="md">
      <Group position="apart" align="center" style={{ marginBottom: 12 }}>
        <ActionIcon variant="light" size="lg" onClick={() => navigate('/')} aria-label="Back to home">
          <IconChevronLeft size={20} />
        </ActionIcon>
        <Title order={2}>Seen movies</Title>
      </Group>

      {items.length === 0 ? (
        <Text color="dimmed">You haven't marked any movies as seen yet.</Text>
      ) : (
        <>
          <Group position="right" style={{ marginBottom: 12 }}>
            <Button color="red" variant="outline" onClick={() => { clearSeen(); setItems([]) }}>Clear all</Button>
          </Group>

          <MovieList movies={items} hideSeen={true} onOpenDetails={(id) => navigate(`/movie/${id}`)} />
        </>
      )}
    </Container>
  )
}
