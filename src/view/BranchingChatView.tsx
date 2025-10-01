import { ItemView, Notice, WorkspaceLeaf } from 'obsidian'
import { createRoot, Root } from 'react-dom/client'
import BranchingChatPlugin from '../main'
import type { BranchingChatSettings } from '../settings'
import { BranchingChatRoot } from '../branchingChat/BranchingChatRoot'

export const BRANCHING_CHAT_VIEW_TYPE = 'obsidian-branching-chat'

export class BranchingChatView extends ItemView {
	private reactRoot: Root | null = null
	private reactContainerEl: HTMLElement | null = null
	private currentSettings: BranchingChatSettings

	constructor(leaf: WorkspaceLeaf, private readonly plugin: BranchingChatPlugin) {
		super(leaf)
		this.currentSettings = plugin.settings
	}

	getViewType(): string {
		return BRANCHING_CHAT_VIEW_TYPE
	}

	getDisplayText(): string {
		return 'Branching Chat Canvas'
	}

	getIcon(): string {
		return 'git-branch'
	}

	async onOpen(): Promise<void> {
		this.containerEl.empty()
		this.containerEl.addClass('obsidian-tldraw-root')

		this.reactContainerEl = this.containerEl.createDiv({
			cls: 'obsidian-tldraw-canvas obsidian-branching-chat-container',
		})

		this.render()
	}

	onClose(): Promise<void> {
		this.reactRoot?.unmount()
		this.reactRoot = null
		this.reactContainerEl?.remove()
		this.reactContainerEl = null
		return Promise.resolve()
	}

	updateSettings(settings: BranchingChatSettings) {
		this.currentSettings = settings
		this.render()
	}

	private render() {
		if (!this.reactContainerEl) return

		if (!this.reactRoot) {
			this.reactRoot = createRoot(this.reactContainerEl)
		}

		const leafId = (this.leaf as any)?.id ?? this.leaf.getViewState().state?.viewId ?? 'default'
		this.reactRoot.render(
			<BranchingChatRoot
				settings={this.currentSettings}
				persistenceKey={`branching-chat-${leafId}`}
				notify={(message) => new Notice(message)}
			/>
		)
	}
}
