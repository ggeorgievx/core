import { Glue42Web } from "../../web";
import { defaultConfigLocation, defaultConfig, defaultWorkerName } from "./defaults";

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

const getRemoteConfig = async (userConfig: Glue42Web.Config): Promise<Glue42Web.Config> => {
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
        return json?.glue ?? {};
    } catch {
        return {};
    }
};

export const buildConfig = async (userConfig?: Glue42Web.Config): Promise<Glue42Web.Config> => {
    userConfig = userConfig ?? {};
    const remoteConfig = await getRemoteConfig(userConfig);
    // merge user->remote->default
    const result = Object.assign({}, defaultConfig, remoteConfig, userConfig);

    // if we have extends options, we need to set the worker location to be the same
    // because worker is always on the same level as custom config
    if (result.extends) {
        const lastIndex = result.extends.lastIndexOf("/");
        const worker = result.extends.substr(0, lastIndex + 1) + defaultWorkerName;
        result.worker = worker;
    }
    return result;
};
