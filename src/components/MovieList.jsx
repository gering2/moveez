import React from 'react'
import MovieCard from './MovieCard'

export default function MovieList({ movies, ratings = {}, onRate, onAddToList, lists, onOpenDetails, hideSeen = false }) {
  return (
    <div className="movie-list">
      {movies.map(m => (
        <MovieCard
          key={m.id}
          movie={m}
          rating={ratings[m.id]}
          onRate={onRate}
          onAddToList={onAddToList}
          lists={lists}
          onOpen={() => onOpenDetails && onOpenDetails(m.id)}
          showSeenToggle={!hideSeen}
        />
      ))}
    </div>
  )
}
