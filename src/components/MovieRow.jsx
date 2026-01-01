import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Title, ActionIcon, Loader } from '@mantine/core'
import MovieCard from './MovieCard'
import { IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react'
export default function MovieRow({ id, title, movies, onOpenDetails, onLoadMore, loading, hasMore }) {
  const rowRef = useRef(null)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [canScrollPrev, setCanScrollPrev] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = rowRef.current
    if (!el) return
    const tolerance = 8
    const canNext = el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance
    const canPrev = el.scrollLeft > tolerance
    setCanScrollNext(canNext)
    setCanScrollPrev(canPrev)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = rowRef.current
    if (!el) return
    const onScroll = () => updateScrollState()
    window.addEventListener('resize', updateScrollState)
    el.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('resize', updateScrollState)
      el.removeEventListener('scroll', onScroll)
    }
  }, [updateScrollState, movies.length])

  function scrollNext() {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
    // ensure state updates after smooth scroll completes
    setTimeout(updateScrollState, 400)
  }

  function scrollPrev() {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' })
    setTimeout(updateScrollState, 400)
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Title order={3} style={{ marginBottom: 8 }}>{title}</Title>
      <div id={id} ref={rowRef} className="movie-row">
        {movies.map(m => (
          <div key={m.id} className="movie-row-item">
            <MovieCard movie={m} />
          </div>
        ))}

        {/* optional load-more icon at end of row (loads next page) */}
        {onLoadMore && hasMore && (
          <div className="movie-row-item">
            <div className="load-more-item">
              <ActionIcon size="xl" variant="filled" color="gray" onClick={onLoadMore} aria-label="Load more movies">
                {loading ? <Loader size="sm" /> : <IconPlus size={20} />}
              </ActionIcon>
            </div>
          </div>
        )}

        {/* scroll arrow shown when there's overflow to the right */}
        {canScrollPrev && (
          <div className="row-scroll-btn left">
            <ActionIcon size="xl" variant="light" onClick={scrollPrev} aria-label="Scroll previous">
              <IconChevronLeft size={22} />
            </ActionIcon>
          </div>
        )}
        {canScrollNext && (
          <div className="row-scroll-btn right">
            <ActionIcon size="xl" variant="light" onClick={scrollNext} aria-label="Scroll next">
              <IconChevronRight size={32} />
            </ActionIcon>
          </div>
        )}
      </div>
    </div>
  )
}
