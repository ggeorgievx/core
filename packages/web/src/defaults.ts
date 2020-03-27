import { Glue42Web } from "../web";

export const defaultConfigLocation = "/shared/glue.config.json";
export const sharedWorkerLocation = "/shared/worker.js";

export const defaultConfig: Glue42Web.Config = {
    sharedWorker: sharedWorkerLocation,
    extends: defaultConfigLocation,
    layouts: {
        autoSaveOnClose: false,
        autoRestoreOnStartup: false,
        autoSaveWindowContext: false
    },
    logger: "error",
};
