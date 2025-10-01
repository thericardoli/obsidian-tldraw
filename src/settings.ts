import { App, PluginSettingTab, Setting } from 'obsidian'
import BranchingChatPlugin from './main'

export interface BranchingChatSettings {
	/** Base URL of the worker that serves the branching chat streaming endpoint. */
	streamEndpoint: string
	/** tldraw v4 production license key. Leave empty for local/dev use. */
	licenseKey?: string
}

export const DEFAULT_SETTINGS: BranchingChatSettings = {
	streamEndpoint: '',
	licenseKey: '',
}

export class BranchingChatSettingTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: BranchingChatPlugin) {
		super(app, plugin)
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		containerEl.createEl('h2', { text: 'Branching Chat settings' })

		new Setting(containerEl)
			.setName('Streaming endpoint')
			.setDesc(
				'Deploy the Cloudflare Worker from templates/branching-chat/worker and paste the base URL here. '
			)
			.addText((text) => {
				text
					.setPlaceholder('https://your-worker.example/stream')
					.setValue(this.plugin.settings.streamEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.streamEndpoint = value.trim()
						await this.plugin.saveSettings()
					})
			})

		new Setting(containerEl)
			.setName('tldraw license key (optional)')
			.setDesc(
				'If Obsidian shows a “Get a license for production” overlay, paste your tldraw v4 license key here. Leave empty for dev/local use.'
			)
			.addText((text) => {
				text
					.setPlaceholder('tlk_XXXXXXXXXXXXXXXX')
					.setValue(this.plugin.settings.licenseKey ?? '')
					.onChange(async (value) => {
						this.plugin.settings.licenseKey = value.trim()
						await this.plugin.saveSettings()
					})
			})
	}
}
