const SEEN_KEY = 'seen_movies_v1'

function read() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
  } catch (e) {
    return []
  }
}

function write(list) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(list))
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('seen:change', { detail: list }))
      }
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
}

function getSeen() {
  return read()
}

function isSeen(id) {
  if (!id) return false
  return read().some(m => m.id === id)
}

function addSeen(movie) {
  if (!movie || !movie.id) return
  const list = read()
  if (list.some(m => m.id === movie.id)) return
  const entry = { id: movie.id, title: movie.title, poster: movie.poster, year: movie.year, seenAt: Date.now() }
  list.push(entry)
  write(list)
}

function removeSeen(id) {
  if (!id) return
  const list = read().filter(m => m.id !== id)
  write(list)
}

function toggleSeen(movie) {
  if (!movie || !movie.id) return
  if (isSeen(movie.id)) removeSeen(movie.id)
  else addSeen(movie)
}

function clearSeen() { write([]) }

export { SEEN_KEY, getSeen, isSeen, addSeen, removeSeen, toggleSeen, clearSeen }
