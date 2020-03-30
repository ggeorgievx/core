import { Glue42Web } from "../../web";

export const defaultSharedLocation = "/glue/";
export const defaultConfigName = "glue.config.json";
export const defaultWorkerName = "worker.js";
export const defaultConfigLocation = `${defaultSharedLocation}${defaultConfigName}`;
export const defaultWorkerLocation = `${defaultSharedLocation}${defaultWorkerName}`;

export const defaultConfig: Glue42Web.Config = {
    worker: defaultWorkerLocation,
    extends: defaultConfigLocation,
    layouts: {
        autoRestore: false,
        autoSaveWindowContext: false
    },
    logger: "error",
};
