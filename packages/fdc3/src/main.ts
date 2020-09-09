import createDesktopAgent from "./agent";
import { Glue42 } from "@glue42/desktop";
import GlueWebFactory from "@glue42/web";
import { isGlue42Core, decorateContextApi } from "./utils";
import { version } from "../package.json";
import { FDC3 } from "../types";
import { WindowType } from "./windowtype";

const defaultGlueConfig = {
    application: (window as WindowType).fdc3AppName,
    appManager: true,
    context: true,
    intents: true,
    channels: true,
    agm: true
};

const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

const patchSharedContexts = (): Promise<void> => {
    return new Promise((resolve) => {
        let interval: any;

        const callback = async (): Promise<void> => {
            const channels = await (window as WindowType).glue.channels.all();
            const firstChannel: Glue42.Channels.ChannelContext = await (window as WindowType).glue.channels.get(channels[0]);

            if (channels.length === 0 || !isEmptyObject(firstChannel)) {
                clearInterval(interval);
                resolve();
            }
        };

        interval = setInterval(callback, 300);

        callback();
    });
};

const setupGlue = (clientGlueConfig?: Glue42.Config): void => {
    if (isGlue42Core) {
        (window as WindowType).gluePromise = GlueWebFactory(defaultGlueConfig)
            .then((g) => {
                const glue = decorateContextApi(g);
                (window as WindowType).glue = glue;

                return patchSharedContexts();
            })
            .then(() => {
                return (window as WindowType).glue;
            });
    } else {
        const waitGlue42GD = new Promise((resolve) => {
            let interval: any;

            const callback = (): void => {
                if ((window as WindowType).glue42gd) {
                    clearInterval(interval);
                    resolve();
                }
            };

            interval = setInterval(callback, 300);

            callback();
        });

        (window as WindowType).gluePromise = waitGlue42GD
            .then(() => {
                const GlueFactory = (window as WindowType).Glue;
                if (!GlueFactory) {
                    return Promise.reject(Error("There is no Glue factory function on the window object !"));
                }
                return GlueFactory(clientGlueConfig || defaultGlueConfig);
            })
            .then((g) => {
                const glue = decorateContextApi(g);
                (window as WindowType).glue = glue;

                return patchSharedContexts();
            })
            .then(() => {
                return (window as WindowType).glue;
            });
    }
};

const fdc3Factory = (): FDC3.DesktopAgent & { version: string } => {
    setupGlue();

    const agentApi = createDesktopAgent();

    return {
        ...agentApi,
        version
    };
};

export default fdc3Factory;
