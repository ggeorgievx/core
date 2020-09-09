import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";

/**
 * Changes to subscribe to comply with the FDC3 specification:
 * 1. Skip updates from myself
 * 2. Ignore initial replay
 */
export const decorateContextApi = (glue: Glue42.Glue | Glue42Web.API): Glue42.Glue | Glue42Web.API => {
    const newGlue: any = { ...glue, contexts: { ...glue.contexts } };

    newGlue.contexts.subscribe = (name: string, callback: (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void): Promise<() => void> => {
        let didReplay = false;
        return newGlue.contexts.subscribe(name, (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => {
            if (!didReplay) {
                didReplay = true;
                return;
            }

            const updateFromMe = extraData.updaterId === glue.interop.instance.instance;

            if (!updateFromMe) {
                callback(data, delta, removed, unsubscribe, extraData);
            }
        });
    };

    return newGlue;
};

export const isGlue42Core = !navigator.userAgent.toLowerCase().includes(" electron/");
