import FormSwitch from '@valenced/components/FormSwitch'
import Page from '@valenced/components/Page'
import { ToastActionCreators } from '@valenced/discord/actions'
import { TableRow, TableRowGroup } from '@valenced/discord/design'
import { createElement, useState } from '@valenced/react'

function getShowGameModule(): any {
	const metroRequire = (globalThis as any).__r
	if (!metroRequire?.c) return null

	for (const id in metroRequire.c) {
		const exp = metroRequire.c[id]?.exports
		if (exp?.ShowCurrentGame?.updateSetting) {
			return exp.ShowCurrentGame
		}
		if (exp?.default?.ShowCurrentGame?.updateSetting) {
			return exp.default.ShowCurrentGame
		}
	}
	return null
}

function SettingsScreen() {
	const showGameModule = getShowGameModule()
	const initialValue = showGameModule ? Boolean(showGameModule.getSetting()) : true
	const [enabled, setEnabled] = useState(initialValue)

	const handleToggle = (nextValue: boolean) => {
		setEnabled(nextValue)
		const mod = getShowGameModule()
		if (mod) {
			mod.updateSetting(nextValue)
			ToastActionCreators?.open?.({
				key: 'game-toggle-toast',
				content: nextValue ? 'Game activity: ON' : 'Game activity: OFF',
			})
		} else {
			ToastActionCreators?.open?.({
				key: 'game-toggle-toast',
				content: 'Could not find ShowCurrentGame setting',
			})
		}
	}

	return createElement(
		Page,
		null,
		createElement(
			TableRowGroup,
			{ title: 'Game Activity' },
			createElement(TableRow, {
				label: 'Display current activity as a status message',
				subLabel: 'Quickly toggle your Discord game status on or off',
				trailing: createElement(FormSwitch, {
					value: enabled,
					onValueChange: handleToggle,
				}),
			}),
		),
	)
}

export default plugin({
	SettingsComponent: SettingsScreen,
	start() {},
	stop() {},
})
