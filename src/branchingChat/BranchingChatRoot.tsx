import { useMemo, useEffect } from 'react'
import type { BranchingChatSettings } from '../settings'
import { BranchingChatConfigProvider } from './config'
import App from './App'
// Import tldraw base styles as text so esbuild bundles them into main.js
import tldrawCss from 'tldraw/tldraw.css'
import indexCss from './index.css'

export interface BranchingChatRootProps {
	settings: BranchingChatSettings
	persistenceKey: string
	notify?: (message: string) => void
}

export function BranchingChatRoot({ settings, persistenceKey, notify }: BranchingChatRootProps) {
	const config = useMemo(
		() => ({
			streamEndpoint: settings.streamEndpoint?.trim() ? settings.streamEndpoint.trim() : null,
			notify,
		}),
		[settings.streamEndpoint, notify]
	)

	// Inject tldraw CSS into document head
	useEffect(() => {
		const styleId = 'tldraw-styles'
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style')
			style.id = styleId
			style.textContent = tldrawCss + '\n' + indexCss
			document.head.appendChild(style)
		}
	}, [])

	return (
		<BranchingChatConfigProvider config={config}>
			<App persistenceKey={persistenceKey} licenseKey={settings.licenseKey} />
		</BranchingChatConfigProvider>
	)
}
