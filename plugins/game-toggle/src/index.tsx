import { Design } from '@valenced/discord/design'
import { ToastActionCreators } from '@valenced/discord/actions'
import { lookupModules } from '@valenced/modules/finders'
import { withProps } from '@valenced/modules/finders/filters'

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
