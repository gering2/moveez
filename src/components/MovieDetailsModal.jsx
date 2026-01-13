import React, { useEffect, useState } from 'react'
import { Modal, Title, Text, Image, Group, Badge, Loader, Stack } from '@mantine/core'
import { useModalState } from '../contexts/ModalContext'
import { getMovieDetails } from '../api/tmdb'

export default function MovieDetailsModal({ id, opened, onClose }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // debug
    // eslint-disable-next-line no-console
    console.log('MovieDetailsModal effect', { opened, id })
    if (!opened || !id) return
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
        if (!cancelled) {
          setData(json)
          // eslint-disable-next-line no-console
          console.log('MovieDetailsModal got data', { id, title: json.title })
        }
      } catch (err) {
        if (!cancelled) setError(String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [opened, id])

  // update global modal state so other components can react
  const { setModalOpen } = useModalState()
  useEffect(() => {
    if (opened) setModalOpen(true)
    else setModalOpen(false)
    return () => setModalOpen(false)
  }, [opened, setModalOpen])

  
  return (

    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      closeOnClickOutside={true}
      closeOnEscape={true}
      centered
      transitionProps={{ transition: 'fade', duration: 200 }}
      lockScroll={false}
      withinPortal={true}
     
      closeButtonProps={{
        'aria-label': 'Close movie details',
        style: { cursor: 'pointer', width: '28px', height: '28px', padding: '6px', minWidth: '28px', minHeight: '28px'  }
      }}
      zIndex={99999}
      overlayProps={{ opacity: 0.65, blur: 6 }}
      classNames={{ modal: 'movie-modal', body: 'movie-modal-body', header: 'movie-modal-header' }}
      styles={{ modal: { border: '1px solid rgba(255,255,255,0.08)' } }}
    >
      {loading && <Loader />}
      {error && <Text color="red">{error}</Text>}
      {data && (
        <Stack spacing="md">
          <Group align="flex-start">
            <Stack spacing="md">
              <Image src={data.poster_path ? `https://image.tmdb.org/t/p/w300${data.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Image'} alt={data.title} width={150} />
              <Title  order={4} style={{marginTop: 5,marginBottom:0}}>{data.title} ({data.release_date ? new Date(data.release_date).getFullYear() : ''})</Title>
            </Stack>

            <Stack spacing="xs" style={{flex: 1}}>
              <Text style={{margin:0,fontSize:12}}>Runtime: {data.runtime ? `${data.runtime} min` : 'N/A'}</Text>
              <Group spacing={5} wrap="nowrap" style={{display: "flex", gap:5, marginTop: 8 }}>
                {(data.genres||[]).map(g => <Badge style={{fontSize: 11, backgroundColor:"var(--accent)", padding: 7, borderRadius:25}} key={g.id} mr={6}>{g.name}</Badge>)}
              </Group>
              <Text mt="med">{data.overview}</Text>
            </Stack>
          </Group>
          {data.credits && data.credits.cast && (
            <Group style={{alignItems:"center",display:"flex", gap:5}} >
              <Title style = {{whiteSpace: "nowrap"}}order={5}>Top cast:</Title>
              <Text style={{fontSize:10}}>{(data.credits.cast||[]).slice(0,6).map(c => c.name).join(', ')}</Text>
            </Group>
          )}
        </Stack>
      )}
    </Modal>

  )
}
