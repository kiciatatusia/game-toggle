import { Design } from '@valenced/discord/design'
import { lookupModules } from '@valenced/modules/finders'
import { withProps } from '@valenced/modules/finders/filters'

interface Settings {
    on: boolean
    note: string
}

// GUESS: the status setting may live under the name CustomStatus.
function findStatus(): any {
    try {
        for (const [exp] of lookupModules(withProps('CustomStatus'))) {
            const s = exp?.CustomStatus ?? exp?.default?.CustomStatus
            if (typeof s?.updateSetting === 'function') return s
        }
    } catch (e) {
        console.error('[status-test] lookup failed', e)
    }
    return null
}

export default plugin<{ jsonStorage: Settings }>({
    jsonStorage: {
        load: true,
        default: { on: false, note: 'not tested yet' },
    },

    SettingsComponent({ api }) {
        const { TableRowGroup, TableSwitchRow } = Design
        const data = api.jsonStorage.use()

        const toggle = (on: boolean) => {
            let note = ''
            try {
                const s = findStatus()
                if (!s) {
                    note = 'CustomStatus module NOT FOUND'
                } else {
                    s.updateSetting(
                        on
                            ? { text: 'Status test', expiresAtMs: '0', emojiId: '0', emojiName: '' }
                            : undefined,
                    )
                    note = on ? 'module found, status set' : 'module found, status cleared'
                }
            } catch (e) {
                note = 'error: ' + String(e).slice(0, 80)
            }
            api.jsonStorage.set({ on, note })
        }

        return (
            <TableRowGroup title="Status Test">
                <TableSwitchRow
                    label="Set test status"
                    subLabel={data?.note ?? ''}
                    value={data?.on ?? false}
                    onValueChange={toggle}
                />
            </TableRowGroup>
        )
    },
})
