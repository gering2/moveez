import React from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import App from './App'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MovieSearchResults from './components/MovieSearchResults'
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
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/search" element={<MovieSearchResults />} />
			</Routes>
		</BrowserRouter>
	</MantineProvider>
)
