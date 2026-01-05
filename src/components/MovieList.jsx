import React from 'react'
import MovieCard from './MovieCard'

export default function MovieList({ movies, ratings = {}, onRate, onAddToList, lists, onOpenDetails }) {
  return (
    <div className="movie-list">
      {movies.map(m => (
        <MovieCard key={m.id} movie={m} rating={ratings[m.id]} onRate={onRate} onAddToList={onAddToList} lists={lists} onOpenDetails={onOpenDetails} />
      ))}
    </div>
  )
}
