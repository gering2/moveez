import React from 'react'
import { Title, Group, Button } from '@mantine/core'
import ProviderNav from './ProviderNav'
import SearchBar from './SearchBar'
import { useNavigate } from 'react-router-dom'

export default function TopNav({ providers, providersLoading, selectedProvider, setSelectedProvider, onSearchSubmit }) {
  const navigate = useNavigate()

  return (
    <div className="top-nav">
        <div className="site-title" style={{flex:'0 0 auto', cursor:'pointer'}} onClick={() => navigate('/') }>
          <Title order={2} style={{color:'var(--accent)', margin:0}}>Moveez</Title>
        </div>

        <div>
          <ProviderNav providers={providers} providersLoading={providersLoading} selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} />
        </div>

        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <SearchBar onSubmit={onSearchSubmit} />
          <Button variant="subtle" onClick={() => navigate('/seen')}>Seen</Button>
        </div>
    </div>
  )
}
    