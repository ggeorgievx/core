import { Glue42Web } from "../../web";
import { LocalWebWindow } from "../windows/my";

export const restoreAutoSavedLayout = (api: Glue42Web.API): Promise<void> => {
    const layoutName = `_auto_${document.location.href}`;
    const layout = api.layouts.list().find((l) => l.name === layoutName);
    if (!layout) {
        return Promise.resolve();
    }
    const my: LocalWebWindow = api.windows.my() as LocalWebWindow;
    if (my.parent) {
        // stop the restore at level 1
        return Promise.resolve();
    }

    api.logger.info(`restoring layout ${layoutName}`);
    // set the context to our window
    const mainComponent = layout.components.find((c) => c.state.main);
    my.setContext(mainComponent?.state.context);

    try {
        return api.layouts.restore({
            name: layoutName,
            closeRunningInstance: false,
        });
    } catch (e) {
        api.logger.error(e);
        return Promise.resolve();
    }
};
