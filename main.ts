import stylesCss from './styles.css'

export { default } from './src/main'

// Inject plugin styles into document head
if (typeof document !== 'undefined') {
	const styleId = 'obsidian-tldraw-base-styles'
	if (!document.getElementById(styleId)) {
		const style = document.createElement('style')
		style.id = styleId
		style.textContent = stylesCss
		document.head.appendChild(style)
	}
}
