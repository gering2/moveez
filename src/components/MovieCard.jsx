import React from 'react'
import { Modal,Card, Skeleton, ActionIcon, Badge } from '@mantine/core'
import { fetchRatings, fetchByImdbID } from '../api/omdb'
import { getMovieDetails } from '../api/tmdb'
import { isSeen, toggleSeen } from '../utils/seen'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import './movie-card.css'
import { useModalState } from '../contexts/ModalContext'

export default function MovieCard({ movie, onOpen, showSeenToggle = true }) {
  const [ratings, setRatings] = React.useState(null)
  const [seen, setSeen] = React.useState(() => isSeen(movie?.id))
  function handleOpen(e) {
    console.log('MovieCard clicked', movie?.id, movie?.title)
    // respect global modal state
    try {
      const { modalOpen } = useModalState()
      if (modalOpen) return
    } catch (err) {
      // fallback: if hook fails, proceed
    }
    // don't open if this movie is marked seen
    if (seen) return
    if (onOpen) onOpen()
  }
  const { modalOpen } = (() => { try { return useModalState() } catch { return { modalOpen: false } } })()

  const [imgLoading, setImgLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    if (!movie || !movie.title) return
    ;(async () => {
      try {
        let r = null
        try {
          const details = await getMovieDetails(movie.id)
          const imdb = details?.external_ids?.imdb_id
          console.debug('MovieCard:getMovieDetails', movie.id, movie.title, { imdb })
          if (imdb) {
            r = await fetchByImdbID(imdb)
            console.debug('MovieCard:OMDb by imdbID result', movie.title, imdb, !!r)
          }
        } catch (e) {
          // ignore details lookup errors and fall back to title/year
        }
        if (!r) {
          r = await fetchRatings(movie.title, movie.year)
          console.debug('MovieCard:OMDb by title result', movie.title, movie.year, !!r)
        }
        if (mounted) setRatings(r)
        if (!r) {
          console.warn('MovieCard: Ratings missing for', movie.title, movie.year, 'tmdbId:', movie.id)
        }
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [movie?.title, movie?.year, movie?.id])

  React.useEffect(() => { setSeen(isSeen(movie?.id)) }, [movie?.id])

  return (
    <Card className={"movie-card" + (modalOpen || seen ? ' disabled' : '')} shadow="sm" padding="xs" radius="md" withBorder onClick={handleOpen} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' && !modalOpen && !seen) onOpen && onOpen() }}>
      <Card.Section>
          <div className="movie-card__poster">
            <Skeleton visible={imgLoading} radius="8px">
                <div style={{position:'relative'}}>
                  <img src={movie.poster} alt={movie.title} loading="lazy" onLoad={() => setImgLoading(false)} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                  {showSeenToggle ? (
                    <div style={{position:'absolute', right:0, top:0, pointerEvents: modalOpen ? 'none' : 'auto'}}>
                      <ActionIcon
                        variant="filled"
                        color={seen ? 'green' : 'gray'}
                        onClick={(e) => { e.stopPropagation(); toggleSeen(movie); setSeen(prev => !prev) }}
                        title={seen ? 'Mark as unseen' : 'Mark as seen'}
                        style={{
                          backgroundColor: seen ? 'rgba(34,197,94,0.85)' : 'rgba(107,114,128,0.75)',
                          color: '#fff',
                          transition: 'background-color 120ms ease, opacity 120ms ease'
                        }}
                      >
                        {seen ? <IconEye size={16} color="#fff" /> : <IconEyeOff size={16} color="#fff" />}
                      </ActionIcon>
                    </div>
                  ) : null}
                </div>
          </Skeleton>
        </div>
      </Card.Section>
      <div style = {{display:"flex",flexDirection:'column',justifyContent:"center",alignItems:"center"}}>
        <div className="movie-card__title">{movie.title}</div>
        <div className="rating-badges">
          {ratings?.imdbRating ? <span className="rating-badge">IMDb {ratings.imdbRating}</span> : null}
          {ratings?.metascore ? <span className="rating-badge">Metascore {ratings.metascore}</span> : null}
        </div>
      </div>
    </Card>
  )
}
