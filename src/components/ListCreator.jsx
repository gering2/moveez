import React, { useState } from 'react'
import { TextInput, Textarea, Button, Stack, Title } from '@mantine/core'

export default function ListCreator({ onCreate }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const submit = (e) => {
    e && e.preventDefault()
    if (!title) return
    onCreate({ title, description: desc, movies: [] })
    setTitle('')
    setDesc('')
  }
  return (
    <form onSubmit={submit}>
      <Stack>
        <Title order={3}>Create List</Title>
        <TextInput placeholder="List title" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
        <Button type="submit">Create</Button>
      </Stack>
    </form>
  )
}
