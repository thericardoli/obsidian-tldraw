import { createContext, ReactNode, useContext, useMemo } from 'react'

export interface BranchingChatConfig {
	streamEndpoint: string | null
	notify?: (message: string) => void
}

const BranchingChatConfigContext = createContext<BranchingChatConfig>({
	streamEndpoint: null,
})

export function BranchingChatConfigProvider({
	config,
	children,
}: {
	config: BranchingChatConfig
	children: ReactNode
}) {
	const value = useMemo(
		() => ({
			streamEndpoint: config.streamEndpoint,
			notify: config.notify,
		}),
		[config.streamEndpoint, config.notify]
	)
	return (
		<BranchingChatConfigContext.Provider value={value}>
			{children}
		</BranchingChatConfigContext.Provider>
	)
}

export function useBranchingChatConfig(): BranchingChatConfig {
	return useContext(BranchingChatConfigContext)
}
