import React from 'react'
import { Title, Group, Button } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import ProviderNav from './ProviderNav'
import SearchBar from './SearchBar'
import { useNavigate } from 'react-router-dom'

export default function TopNav({ providers, providersLoading, selectedProvider, setSelectedProvider, onSearchSubmit }) {
  const navigate = useNavigate()

  return (
    <div className="top-nav">
      <div className="top-nav-inner">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Title order={2} style={{color:'var(--accent)', margin:0}}>Moveez</Title>
          <ProviderNav providers={providers} providersLoading={providersLoading} selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} />
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Button className="seen-btn" onClick={() => navigate('/seen')}><IconCheck size={16} />Seen Movies/Tv</Button>
          <SearchBar onSubmit={onSearchSubmit} />
        </div>
      </div>
    </div>
  )
}
    