import { ToastActionCreators } from '@valenced/discord/actions'
import { lookupModuleWithImportedPath } from '@valenced/discord/utils/modules/finders'
import { instead } from '@valenced/patcher'

let unpatch: (() => void) | undefined

function toggleGameActivity() {
	try {
		// Szukamy wewnętrznego modułu ustawień Discorda (ShowCurrentGame)
		const settingsMod = lookupModuleWithImportedPath<any>(
			'modules/settings/UserSettingsProtoStore.tsx',
		)?.[0]

		const protoUtils = lookupModuleWithImportedPath<any>(
			'utils/UserSettingsProtoUtils.tsx',
		)?.[0]

		// Uniwersalne wyszukiwanie obiektu ShowCurrentGame w modułach Metro
		let showGameSetting: any = null
		const metroRequire = (globalThis as any).__r
		if (metroRequire?.c) {
			for (const id in metroRequire.c) {
				const exp = metroRequire.c[id]?.exports
				if (exp?.ShowCurrentGame?.updateSetting) {
					showGameSetting = exp.ShowCurrentGame
					break
				}
				if (exp?.default?.ShowCurrentGame?.updateSetting) {
					showGameSetting = exp.default.ShowCurrentGame
					break
				}
			}
		}

		if (showGameSetting) {
			const current = Boolean(showGameSetting.getSetting())
			const next = !current
			showGameSetting.updateSetting(next)
			ToastActionCreators?.open?.({
				key: 'game-toggle-toast',
				content: next ? 'Game activity: ON' : 'Game activity: OFF',
			})
		} else {
			ToastActionCreators?.open?.({
				key: 'game-toggle-toast',
				content: 'Could not find ShowCurrentGame setting',
			})
		}
	} catch (e) {
		ToastActionCreators?.open?.({
			key: 'game-toggle-toast',
			content: `Toggle error: ${String(e)}`,
		})
	}
}

export default plugin({
	start() {
		// Przechwytujemy wysyłanie wiadomości z treścią "/gametoggle"
		const MessageActions = lookupModuleWithImportedPath<any>(
			'actions/MessageActionCreators.tsx',
		)?.[0]?.default

		if (MessageActions?.sendMessage) {
			unpatch = instead(MessageActions, 'sendMessage', (args, orig) => {
				const content = args?.[1]?.content?.trim()?.toLowerCase()
				if (content === '/gametoggle') {
					toggleGameActivity()
					return Promise.resolve()
				}
				return orig.apply(this, args)
			})
		}
	},
	stop() {
		unpatch?.()
	},
})
					
