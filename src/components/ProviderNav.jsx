import React from 'react'
import { Avatar, Loader, Text } from '@mantine/core'

export default function ProviderNav({ providers, providersLoading, selectedProvider, setSelectedProvider }) {
  return (
      <div className="provider-nav">
        <div className="provider-row">
          {providersLoading ? (
            <button className="provider-link" disabled aria-disabled="true">
              <Loader size={14} />
            </button>
          ) : providers.length === 0 ? (
            <Text size="xs" color="dimmed">No providers</Text>
          ) : providers.slice(0,40).map(p => (
            <button
              key={p.provider_id}
              className={`provider-link ${selectedProvider === p.provider_id ? 'active' : ''}`}
              aria-pressed={selectedProvider === p.provider_id}
              onClick={() => setSelectedProvider(prev => prev === p.provider_id ? prev : p.provider_id)}
            >
              {p.logo_url ? (
                <Avatar className="provider-avatar" src={p.logo_url} radius="xs" size={20} />
              ) : null}
              <span className="provider-name">{p.provider_name}</span>
            </button>
          ))}
        </div>
      </div>
  )
}
