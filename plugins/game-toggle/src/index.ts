import { registerCommand } from "@valenced/api/commands";
import { findByProps } from "@valenced/api/metro";

let unregister: (() => void) | undefined;

export default {
    onLoad() {
        unregister = registerCommand({
            name: "gametoggle",
            description: "Toggles showing current game activity",
            execute: async () => {
                try {
                    const settingsModule = findByProps("ShowCurrentGame");
                    if (settingsModule?.ShowCurrentGame) {
                        const current = settingsModule.ShowCurrentGame.getSetting();
                        await settingsModule.ShowCurrentGame.updateSetting(!current);
                        return {
                            content: !current
                                ? "🟢 Game activity display has been **ENABLED**."
                                : "🔴 Game activity display has been **DISABLED**."
                        };
                    }
                    return { content: "❌ Could not find the ShowCurrentGame setting." };
                } catch (err) {
                    return { content: `❌ Error: ${String(err)}` };
                }
            }
        });
    },
    onUnload() {
        unregister?.();
    }
};
              
