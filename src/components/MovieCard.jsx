import React from 'react'
import { Card, Image } from '@mantine/core'

export default function MovieCard({ movie }) {
  return (
    <Card className="movie-card" shadow="sm" padding="xs" radius="md" withBorder>
      <Card.Section>
        <div className="movie-card__poster">
          <Image src={movie.poster} alt={movie.title} fit="cover" />
        </div>
      </Card.Section>
      <div className="movie-card__title">{movie.title}</div>
      {movie.overview && (
        <div className="movie-card__overview">{movie.overview}</div>
      )}
      {/*
      <div className="movie-card__footer">
        <span className="movie-card__year">{movie.year}</span>
      </div>
      */}
    </Card>
  )
}
