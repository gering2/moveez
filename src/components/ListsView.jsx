import React from 'react'
import { Card, Title, Text, Badge, Stack, Group, TextInput, Button } from '@mantine/core'

export default function ListsView({ lists, movies, onAddToList }) {
  const findMovie = id => movies.find(m => m.id === id)
  return (
    <Stack>
      <Title order={3}>Your Lists</Title>
      {lists.length === 0 && <Text>No lists yet.</Text>}
      {lists.map(l => (
        <Card key={l.id} shadow="xs" padding="sm" radius="md" withBorder>
          <Group position="apart">
            <Text weight={700}>{l.title}</Text>
            <Badge>{(l.movies||[]).length} movies</Badge>
          </Group>
          <Text size="sm" color="dimmed">{l.description}</Text>
          <Stack mt="sm">
            {(l.movies||[]).map(id => {
              const m = findMovie(id)
              return m ? <Text key={id}>{m.title}</Text> : null
            })}
            <Group>
              <TextInput placeholder="Add movie ID" type="number" id={`add-to-${l.id}`} />
              <Button size="xs" onClick={() => {
                const el = document.getElementById(`add-to-${l.id}`)
                if (!el) return
                const val = Number(el.value)
                if (val) onAddToList(l.id, val)
                el.value = ''
              }}>Add</Button>
            </Group>
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
