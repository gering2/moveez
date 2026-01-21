import React from 'react'
import ThemedButton from './ThemedButton'
import { Avatar, Loader, Text } from '@mantine/core'

export default function ProviderNav({ providers, providersLoading, selectedProvider, setSelectedProvider }) {
  return (
    <div style={{flex:'0 1 auto', minWidth:0}}>
      <div className="provider-nav">
        <div className="provider-row">
          {providersLoading ? (
            <ThemedButton className="provider-btn" variant="provider" disabled>
              <Loader size={14} />
            </ThemedButton>
          ) : providers.length === 0 ? (
            <Text size="xs" color="dimmed">No providers</Text>
          ) : providers.slice(0,40).map(p => (
            <ThemedButton key={p.provider_id} className="provider-btn" variant="provider" active={selectedProvider === p.provider_id} disabled={selectedProvider === p.provider_id} onClick={() => setSelectedProvider(prev => prev === p.provider_id ? prev : p.provider_id)}>
              {p.logo_url ? (
                <Avatar className="provider-avatar" src={p.logo_url} radius="xs" size={20} />
              ) : (
                <div className="provider-bullet" aria-hidden="true" />
              )}
              <span className="provider-name">{p.provider_name}</span>
            </ThemedButton>
          ))}
        </div>
      </div>
    </div>
  )
}
