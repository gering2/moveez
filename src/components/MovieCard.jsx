import React, { useState } from 'react'
import { Modal,Card, Image } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

export default function MovieCard({ movie, onOpen }) {
  function handleOpen(e) {
    // log click for debugging modal/navigation
    // eslint-disable-next-line no-console
    console.log('MovieCard clicked', movie?.id, movie?.title)
    if (onOpen) onOpen()
  }

  return (
    <Card className="movie-card" shadow="sm" padding="xs" radius="md" withBorder onClick={handleOpen} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onOpen && onOpen() }}>
      <Card.Section>
        <div className="movie-card__poster">
          <Image src={movie.poster} alt={movie.title} fit="cover" />
        </div>
      </Card.Section>
      <div className="movie-card__title">{movie.title}</div>
      {movie.overview && (
        <div className="movie-card__overview">{movie.overview}</div>
      )}

      {/* footer */}
      {/*
      <div className="movie-card__footer">
        <span className="movie-card__year">{movie.year}</span>
      </div>
      */}
    </Card>
  )
}
