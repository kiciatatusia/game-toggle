import { Design } from '@valenced/discord/design'
import { ToastActionCreators } from '@valenced/discord/actions'
import { lookupModules } from '@valenced/modules/finders'
import { withProps } from '@valenced/modules/finders/filters'
import { after } from '@valenced/patcher'
import { ReactJSXRuntime } from '@valenced/react'

interface Settings {
    enabled: boolean
}

// Finds Discord's ShowCurrentGame user setting module.
function findShowGame(): any {
    try {
        for (const [exp] of lookupModules(withProps('ShowCurrentGame'))) {
            const s = exp?.ShowCurrentGame ?? exp?.default?.ShowCurrentGame
            if (typeof s?.updateSetting === 'function') return s
        }
    } catch (e) {
        console.error('[game-toggle] lookup failed', e)
    }
    return null
}

export default plugin<{ jsonStorage: Settings }>({
    jsonStorage: {
        load: true,
        default: { enabled: true },
    },

    start({ cleanup }) {
        // Temporary scout: shows names of tab-bar-like components as toasts.
        // Will be removed once the bottom bar component is identified.
        const seen = new Set<string>()
        let shown = 0
        const scan = (args: any[]) => {
            const type = args[0]
            if (typeof type !== 'function' && typeof type !== 'object') return
            const name = type?.displayName || type?.name || type?.type?.name
            if (name && /tab|bottom|nav/i.test(name) && !seen.has(name)) {
                seen.add(name)
                console.log('[tab-scout]', name)
                if (shown < 8) {
                    shown++
                    ToastActionCreators.open('tab-scout-' + name, {
                        text: 'scout: ' + name,
                        variant: 'success',
                    })
                }
            }
        }
        cleanup(after(ReactJSXRuntime, 'jsx', (args: any[]) => { scan(args) }))
        cleanup(after(ReactJSXRuntime, 'jsxs', (args: any[]) => { scan(args) }))
    },

    SettingsComponent({ api }) {
        const { TableRowGroup, TableSwitchRow } = Design
        const settings = api.jsonStorage.use()
        const setting = findShowGame()

        const toggle = (enabled: boolean) => {
            api.jsonStorage.set({ enabled })
            try {
                if (!setting) throw new Error('ShowCurrentGame not found')
                setting.updateSetting(enabled)
                ToastActionCreators.open('game-toggle', {
                    text: enabled ? 'Game activity: ON' : 'Game activity: OFF',
                    variant: 'success',
                })
            } catch (e) {
                console.error('[game-toggle]', e)
            }
        }

        return (
            <TableRowGroup title="Game Activity">
                <TableSwitchRow
                    label="Display current activity as a status message"
                    subLabel={setting ? undefined : 'ShowCurrentGame setting not found'}
                    value={settings?.enabled ?? true}
                    onValueChange={toggle}
                />
            </TableRowGroup>
        )
    },
})
