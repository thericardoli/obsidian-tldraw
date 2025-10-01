import { Plugin, WorkspaceLeaf } from 'obsidian'
import { BranchingChatSettingTab, BranchingChatSettings, DEFAULT_SETTINGS } from './settings'
import { BranchingChatView, BRANCHING_CHAT_VIEW_TYPE } from './view/BranchingChatView'

export default class BranchingChatPlugin extends Plugin {
	settings: BranchingChatSettings = DEFAULT_SETTINGS

	async onload(): Promise<void> {
		await this.loadSettings()

		this.registerView(BRANCHING_CHAT_VIEW_TYPE, (leaf) => new BranchingChatView(leaf, this))

		this.addRibbonIcon('git-branch', 'Open Branching Chat canvas', () => {
			void this.activateView()
		})

		this.addCommand({
			id: 'open-branching-chat',
			name: 'Open Branching Chat canvas',
			callback: () => {
				void this.activateView()
			},
		})

		this.addSettingTab(new BranchingChatSettingTab(this.app, this))
	}

	onunload(): void {
		this.app.workspace.getLeavesOfType(BRANCHING_CHAT_VIEW_TYPE).forEach((leaf) => {
			leaf.detach()
		})
	}

	async loadSettings() {
		const persisted = (await this.loadData()) as Partial<BranchingChatSettings> | null
		this.settings = Object.assign({}, DEFAULT_SETTINGS, persisted)
	}

	async saveSettings() {
		await this.saveData(this.settings)
		this.refreshOpenViews()
	}

	private refreshOpenViews() {
		for (const leaf of this.app.workspace.getLeavesOfType(BRANCHING_CHAT_VIEW_TYPE)) {
			const view = leaf.view
			if (view instanceof BranchingChatView) {
				view.updateSettings(this.settings)
			}
		}
	}

	private async activateView() {
		const { workspace } = this.app
		const existing = workspace.getLeavesOfType(BRANCHING_CHAT_VIEW_TYPE)
		if (existing.length > 0) {
			workspace.revealLeaf(existing[0])
			return
		}

		const leaf = workspace.getLeaf(true)
		await leaf.setViewState({
			type: BRANCHING_CHAT_VIEW_TYPE,
			active: true,
		})
		workspace.revealLeaf(leaf)
	}
}
