import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Title, Loader, ActionIcon } from '@mantine/core'
import MovieCard from './MovieCard'
import { IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react'
import ThemedButton from './ThemedButton'
export default function MovieRow({ id, title, movies, onOpenDetails, onLoadMore, loading, hasMore }) {
  const rowRef = useRef(null)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [arrowTop, setArrowTop] = useState(null)
  const [arrowVisible, setArrowVisible] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = rowRef.current
    if (!el) return
    // compute remaining scroll and use a small epsilon to avoid off-by-one issues
    const epsilon = 2
    const remaining = Math.max(0, el.scrollWidth - el.clientWidth - el.scrollLeft)
    const canNext = remaining > epsilon
    const canPrev = el.scrollLeft > epsilon
    // debug: log metrics so we can inspect why arrows hide (safe guard)
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('MovieRow.updateScrollState', { id, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollLeft: el.scrollLeft, remaining, canNext, canPrev })
    }

    setCanScrollNext(canNext)
    setCanScrollPrev(canPrev)

    // compute arrow vertical position and visibility for fixed-edge arrows
    try {
      const rect = el.getBoundingClientRect()
      const mid = Math.round(rect.top + rect.height / 2)
      const visible = rect.bottom > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight)
      setArrowTop(mid)
      setArrowVisible(visible)
    } catch (e) {
      setArrowVisible(false)
    }
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = rowRef.current
    if (!el) return
    const onScroll = () => updateScrollState()
    window.addEventListener('resize', updateScrollState)
    window.addEventListener('scroll', updateScrollState, { passive: true })
    el.addEventListener('scroll', onScroll)
    // observe size/child changes (e.g., when more cards are appended)
    let ro = null
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => updateScrollState())
      ro.observe(el)
    }
    return () => {
      window.removeEventListener('resize', updateScrollState)
      window.removeEventListener('scroll', updateScrollState)
      el.removeEventListener('scroll', onScroll)
      if (ro) ro.disconnect()
    }
  }, [updateScrollState, movies.length])

  function scrollNext() {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
  }

  function scrollPrev() {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Title order={3} style={{ marginBottom: 8 }}>{title}</Title>
      <div id={id} ref={rowRef} className="movie-row">
        {movies.map(m => (
          <div key={m.id} className="movie-row-item">
            <MovieCard movie={m} onOpen={() => onOpenDetails && onOpenDetails(m.id)} />
          </div>
        ))}

        {/* optional load-more icon at end of row (loads next page) */}
        {onLoadMore && hasMore && (
          <div className="movie-row-item">
            <div className="load-more-item">
              <ThemedButton variant="load" onClick={onLoadMore} aria-label="Load more movies">
                {loading ? <Loader size={14} /> : <IconPlus size={18} />}
              </ThemedButton>
            </div>
          </div>
        )}

        {/* arrows: always render (disabled when scrolling isn't possible) */}
        <>
          <div
            className="row-scroll-btn left"
            style={arrowVisible && arrowTop != null ? { position: 'fixed', left: 12, top: arrowTop, transform: 'translateY(-50%)' } : { display: 'none' }}
          >
            <ActionIcon size="xl" variant="light" onClick={scrollPrev} aria-label="Scroll previous" disabled={!canScrollPrev}>
              <IconChevronLeft size={22} />
            </ActionIcon>
          </div>
          <div
            className="row-scroll-btn right"
            style={arrowVisible && arrowTop != null ? { position: 'fixed', right: 12, top: arrowTop, transform: 'translateY(-50%)' } : { display: 'none' }}
          >
            <ActionIcon size="xl" variant="light" onClick={scrollNext} aria-label="Scroll next" disabled={!canScrollNext}>
              <IconChevronRight size={32} />
            </ActionIcon>
          </div>
        </>
      </div>
    </div>
  )
}
