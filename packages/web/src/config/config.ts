import { Glue42Web } from "../../web";
import { defaultConfigLocation, defaultConfig, defaultWorkerName } from "./defaults";
import { Glue42CoreConfig } from "../glue.config";

const fetchTimeout = (url: string, timeoutMilliseconds = 1000): Promise<Response> => {
    return new Promise((resolve, reject) => {
        let timeoutHit = false;
        const timeout = setTimeout(() => {
            timeoutHit = true;
            reject(new Error(`Fetch request for: ${url} timed out at: ${timeoutMilliseconds} milliseconds`));
        }, timeoutMilliseconds);

        fetch(url)
            .then((response) => {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    resolve(response);
                }
            })
            .catch((err) => {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    reject(err);
                }
            });
    });
};

const getRemoteConfig = async (userConfig: Glue42Web.Config): Promise<Glue42CoreConfig> => {
    // check userConfig, if not there check defaultConfig, if not there use the defaultConfigLocation
    const extend: string | false = userConfig.extends ?? defaultConfig.extends ?? defaultConfigLocation;
    if (extend === false) {
        // user has disabled extending the config
        return {};
    }
    let response: Response;
    try {
        response = await fetchTimeout(extend);
        if (!response.ok) {
            return {};
        }

        const json = await response.json();
        return json ?? {};
    } catch {
        return {};
    }
};

export const buildConfig = async (userConfig?: Glue42Web.Config): Promise<Glue42CoreConfig> => {
    userConfig = userConfig ?? {};
    const remoteConfig = await getRemoteConfig(userConfig);

    // merge user->remote->default
    const resultWebConfig: Glue42Web.Config = {
        ...defaultConfig,
        ...remoteConfig.glue,
        ...userConfig
    };

    // if we have extends options, we need to set the worker location to be the same
    // because worker is always on the same level as custom config
    if (resultWebConfig?.extends) {
        const lastIndex = resultWebConfig.extends.lastIndexOf("/");
        const worker = resultWebConfig.extends.substr(0, lastIndex + 1) + defaultWorkerName;
        resultWebConfig.worker = worker;
    }
    return {
        ...remoteConfig,
        glue: resultWebConfig
    };
};
