import { ToastActionCreators } from '@valenced/discord/actions'
import React from '@valenced/react'
import { Switch, Text, View } from '@valenced/react/native'

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
	const [enabled, setEnabled] = React.useState(initialValue)

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

	return React.createElement(
		View,
		{ style: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
		React.createElement(
			Text,
			{ style: { color: '#ffffff', fontSize: 16, fontWeight: '600' } },
			'Show Current Game Activity',
		),
		React.createElement(Switch, {
			value: enabled,
			onValueChange: handleToggle,
		}),
	)
}

export default plugin({
	SettingsComponent: SettingsScreen,
	start() {},
	stop() {},
})
