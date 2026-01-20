import React from 'react'
import { TextInput, Loader, Text } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { searchMovies } from '../api/tmdb'

export default function SearchBar({ onSubmit }) {
  const [search, setSearch] = React.useState('')
  const [suggestions, setSuggestions] = React.useState([])
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  React.useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSuggestions([])
      setLoadingSuggestions(false)
      return
    }

    setLoadingSuggestions(true)
    const t = setTimeout(async () => {
      try {
        const json = await searchMovies(search.trim(), 1)
        const mapped = (json.results || []).map(m => ({
          id: m.id,
          title: m.title,
          year: m.release_date ? new Date(m.release_date).getFullYear() : '',
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'https://via.placeholder.com/48x72?text=No',
        })).slice(0, 8)
        setSuggestions(mapped)
        setShowSuggestions(true)
      } catch (err) {
        console.warn('Autocomplete search failed', err)
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(t)
  }, [search])

  function handleSubmit(q) {
    const qtrim = (q || search || '').trim()
    if (!qtrim) return
    if (onSubmit) onSubmit(qtrim)
  }

  return (
    <div style={{position:'relative', flex:'0 0 auto'}}>
      <TextInput
        className="toolbar-search"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        onFocus={() => { if (suggestions.length) setShowSuggestions(true) }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        rightSection={<IconSearch size={16} />}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="toolbar-autocomplete" role="listbox">
          {suggestions.map(s => (
            <div key={s.id} className="toolbar-autocomplete-item" onMouseDown={() => { handleSubmit(s.title); setShowSuggestions(false) }}>
              <img src={s.poster} alt="" className="toolbar-autocomplete-poster" loading="lazy" />
              <div className="toolbar-autocomplete-meta">
                <div className="toolbar-autocomplete-title">{s.title}</div>
                <div className="toolbar-autocomplete-year">{s.year}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
