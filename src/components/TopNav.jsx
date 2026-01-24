import React from 'react'
import { Title, Group, Button } from '@mantine/core'
import ProviderNav from './ProviderNav'
import SearchBar from './SearchBar'
import { useNavigate } from 'react-router-dom'

export default function TopNav({ providers, providersLoading, selectedProvider, setSelectedProvider, onSearchSubmit }) {
  const navigate = useNavigate()

  return (
    <div className="top-nav">
          <Title order={2} style={{color:'var(--accent)', margin:0}}>Moveez</Title>

          <ProviderNav providers={providers} providersLoading={providersLoading} selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} />
                  <Button variant="subtle" onClick={() => navigate('/seen')}>Seen</Button>

        
        <div style={{marginLeft:400}}>
          <SearchBar onSubmit={onSearchSubmit} />
        </div>
    </div>
  )
}
    