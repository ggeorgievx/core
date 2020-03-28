import { Glue42Web } from "../../web";
import { StartingContext } from "../types";
import { LocalWebWindow } from "./my";

export const registerChildStartupContext = (interop: Glue42Web.Interop.API, parent: string, id: string, name: string, options?: Glue42Web.Windows.CreateOptions) => {
    const methodName = createMethodName(id);
    const startingContext: StartingContext = {
        context: options?.context ?? {},
        name,
        parent
    };
    interop.register(methodName, () => startingContext);
};

export const initStartupContext = async (core: Glue42Web.API) => {
    const my = core.windows?.my() as LocalWebWindow;
    // retrieve the startup context from the window that created us
    const methodName = createMethodName(my.id);
    if (core.interop.methods().find((m) => m.name === methodName)) {
        const result = await core.interop.invoke<StartingContext>(methodName);
        if (my) {
            my.setContext(result.returned.context);
            my.name = result.returned.name;
            my.parent = result.returned.parent;
        }
    }
};

const createMethodName = (id: string) => `"GC.Wnd."${id}`;
