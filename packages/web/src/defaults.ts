import { Glue42Web } from "../web";

export const defaultConfigLocation = "/glue/glue.config.json";
export const defaultWorkerLocation = "/glue/worker.js";

export const defaultConfig: Glue42Web.Config = {
    worker: defaultWorkerLocation,
    extends: defaultConfigLocation,
    layouts: {
        autoRestore: false,
        autoSaveWindowContext: false
    },
    logger: "error",
};
