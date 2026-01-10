import React from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import App from './App'
import { BrowserRouter, Routes, Route, useLocation, useParams, useNavigate } from 'react-router-dom'
import MovieSearchResults from './components/MovieSearchResults'
import MovieDetailsModal from './components/MovieDetailsModal'
import MovieDetailsPage from './components/MovieDetailsPage'

function RouterWrapper() {
	const location = useLocation()
	const state = location.state && location.state.background ? { background: location.state.background } : null
	const background = location.state && location.state.background ? location.state.background : null

		// debug
		if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
			// eslint-disable-next-line no-console
			console.debug('RouterWrapper', { location, background })
		}

	return (
		<>
			<Routes location={background || location}>
				<Route path="/" element={<App />} />
				<Route path="/search" element={<MovieSearchResults />} />
				<Route path="/movie/:id" element={<MovieDetailsPage />} />
			</Routes>

			{background && (
				<Routes>
					<Route path="/movie/:id" element={<ModalRouteWrapper />} />
				</Routes>
			)}
		</>
	)
}

function ModalRouteWrapper() {
	const { id } = useParams()
	const navigate = useNavigate()
		// debug - always log so user can see console output
		// eslint-disable-next-line no-console
		console.log('ModalRouteWrapper mounting for id', id)
		return <MovieDetailsModal id={id} opened={true} onClose={() => navigate(-1)} />
}
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
				<RouterWrapper />
		</BrowserRouter>
	</MantineProvider>
)
