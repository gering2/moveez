import React from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import App from './App'
import './styles.css'

const root = createRoot(document.getElementById('root'))
root.render(
	<MantineProvider
		withGlobalStyles
		withNormalizeCSS
		theme={{
			colorScheme: 'dark',
			primaryColor: 'indigo',
			fontFamily: 'Inter, Segoe UI, Arial, Helvetica, sans-serif',
			headings: { fontFamily: 'Inter, sans-serif' },
			defaultRadius: 'sm',
		}}
	>
		<App />
	</MantineProvider>
)
