import GlueWebFactory, { Glue42Web } from "../web";
import Glue42CoreFactory, { Glue42Core } from "@glue42/core";
import { version } from "../package.json";
import { Windows } from "./windows/main";
import { Layouts } from "./layouts/main";
import { Glue42 } from "@glue42/desktop";
import { Glue42DesktopWindowContext, StartingContext } from "./types";
import { Notifications } from "./notifications/main";
import { sharedWorkerLocation } from "./defaults";
import { buildConfig } from "./config";
import { Control } from "./control/control";
import { SaveAutoLayoutCommand } from "./control/commands";
import { LocalWebWindow } from "./windows/my";

const CreateGlueWeb: GlueWebFactory = async (config?: Glue42Web.Config): Promise<Glue42Web.API | Glue42.Glue> => {
    config = await buildConfig(config);

    // check if we're running in Glue42 Enterprise, if so return @glue42/desktop API
    const gdWindowContext = window as unknown as Glue42DesktopWindowContext;
    if (gdWindowContext.glue42gd && gdWindowContext.Glue) {
        return gdWindowContext.Glue({
            windows: true,
            logger: config.logger
        });
    }

    // create @glue42/core with the extra libs for @glue42/web
    const control = new Control();
    let windows: Windows;
    const ext: Glue42Core.Extension = {
        libs: [
            {
                name: "windows",
                create: (coreLib) => {
                    windows = new Windows(coreLib.interop, control);
                    return windows;
                }
            },
            {
                name: "notifications",
                create: (coreLib) => new Notifications(coreLib.interop)
            },
            {
                name: "layouts",
                create: (coreLib) => new Layouts(windows, coreLib.interop, coreLib.logger.subLogger("layouts"), control, config)
            }
        ],
        version
    };

    const coreConfig = {
        gateway: {
            sharedWorker: config?.sharedWorker ?? sharedWorkerLocation
        },
        logger: config?.logger
    };

    const core = await Glue42CoreFactory(coreConfig, ext) as Glue42Web.API;
    control.start(core.interop, core.logger.subLogger("control"));

    await initStartupContext(core);
    await restoreAutoSavedLayout(core, config);
    await hookCloseEvents(core, config, control);

    return core;
};

const initStartupContext = async (core: Glue42Web.API) => {
    // retrieve the startup context from the window that created us
    const methodName = `GC.Wnd.${core.interop.instance.windowId}`;
    if (core.interop.methods().find((m) => m.name === methodName)) {
        const result = await core.interop.invoke<StartingContext>(methodName);
        const my = core.windows?.my() as LocalWebWindow;
        if (my) {
            my.setContext(result.returned.context);
            my.name = result.returned.name;
            my.parent = result.returned.parent;
        }
    }
};

const hookCloseEvents = (api: Glue42Web.API, config: Glue42Web.Config, control: Control) => {
    // hook up page close event's, so we can cleanup properly
    let done = false;
    const doneFn = async () => {
        if (!done) {
            done = true;
            const shouldSave = config?.layouts?.autoSaveOnClose;
            if (shouldSave) {
                // we don't have enough time to
                const allChildren = (api.windows as Windows).getChildWindows().map((w) => w.id);
                const firstChild = allChildren[0];
                const layoutName = `_auto_${document.location.href}`;
                if (allChildren.length > 0) {
                    const layouts = api.layouts as Layouts;
                    const command: SaveAutoLayoutCommand = {
                        domain: "layouts",
                        command: "saveAutoLayout",
                        args: {
                            childWindows: allChildren,
                            closeEveryone: true,
                            layoutName,
                            context: {},
                            metadata: {},
                            parentInfo: layouts.getLocalLayoutComponent({}, true)
                        }
                    };
                    control.send(command, { windowId: firstChild });
                } else {
                    // TODO -save me only
                    api.layouts.save({ name: layoutName });
                }
            }
            api.done();
        }
    };

    window.addEventListener("beforeunload", async (event) => {
        doneFn();
        // event.returnValue = "saving layouts...";
    });
    window.addEventListener("unload", async () => {
        doneFn();
    });
};

const restoreAutoSavedLayout = (api: Glue42Web.API, config: Glue42Web.Config): Promise<void> => {
    if (!config.layouts?.autoRestoreOnStartup) {
        return Promise.resolve();
    }
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
    const mainComponent = layout.components.find((c) => c.main);
    my.setContext(mainComponent?.windowContext);

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
// attach to window object
if (typeof window !== "undefined") {
    (window as any).GlueWeb = CreateGlueWeb;
}

// add default library for ES6 modules
(CreateGlueWeb as any).default = CreateGlueWeb;
(CreateGlueWeb as any).version = version;

export default CreateGlueWeb;
