import React from 'react'
import { Drawer, Group, Avatar, Text, Button, ScrollArea } from '@mantine/core'
import { IconEye, IconTrash } from '@tabler/icons-react'
import { getSeen, removeSeen } from '../utils/seen'
import { useNavigate } from 'react-router-dom'

export default function SeenDrawer({ opened, onClose }) {
  const [items, setItems] = React.useState(getSeen())
  const navigate = useNavigate()

  React.useEffect(() => setItems(getSeen()), [opened])

  function handleRemove(id) {
    removeSeen(id)
    setItems(getSeen())
  }

  return (
    <Drawer position="right" onClose={onClose} opened={opened} title="Seen movies" padding="md" size="xs">
      <ScrollArea style={{ height: '60vh' }}>
        {items.length === 0 ? (
          <Text color="dimmed">No seen movies</Text>
        ) : (
          items.map(i => (
            <Group key={i.id} spacing="sm" style={{ marginBottom: 8 }}>
              <Avatar src={i.poster} size={40} radius="sm" />
              <div style={{ flex: 1 }}>
                <Text lineClamp={1}>{i.title}</Text>
                <Text size="xs" color="dimmed">{i.year}</Text>
              </div>
              <Button variant="subtle" color="red" size="xs" onClick={() => handleRemove(i.id)} leftIcon={<IconTrash size={14} />}>Remove</Button>
            </Group>
          ))
        )}
      </ScrollArea>
      <Group position="apart" style={{ marginTop: 12 }}>
        <Button leftIcon={<IconEye size={16} />} onClick={() => { onClose && onClose(); navigate('/seen') }}>View all</Button>
      </Group>
    </Drawer>
  )
}
