import { LocalWebWindow } from "../windows/my";
import { RemoteCommand, ControlDomain, LayoutRemoteCommand } from "./commands";
import { Glue42Web } from "../../web";

/**
 * This component wraps the internal message exchange between this and other Glue42 enabled windows.
 */
export class Control {
    public static CONTROL_METHOD = "GC.Control";

    private myWindow: LocalWebWindow | undefined;
    private interop!: Glue42Web.Interop.API;
    private callbacks: { [domain: string]: (command: RemoteCommand) => void } = {};
    private logger!: Glue42Web.Logger.API;

    public start(interop: Glue42Web.Interop.API, logger: Glue42Web.Logger.API) {
        this.interop = interop;
        this.logger = logger;
        this.interop.register(Control.CONTROL_METHOD, async (arg: any) => {
            const command = arg as RemoteCommand;
            logger.trace(`received control command ${JSON.stringify(command)}`);
            if (command.domain === "windows") {
                if (!this.myWindow) {
                    return;
                }
                const result = (this.myWindow as any)[command.command].call(this.myWindow, command.args);
                if (command.skipResult) {
                    return {};
                } else {
                    return result;
                }
            }
            if (command.domain === "layouts") {
                const callback = this.callbacks[command.domain];
                if (callback) {
                    callback(command);
                }
            }
        });
    }

    public send(command: RemoteCommand, target: Glue42Web.Interop.Instance) {
        if (!this.interop) {
            throw new Error("Control not started");
        }
        this.logger.info(`sending control command ${JSON.stringify(command)} to ${JSON.stringify(target)}}`);
        return this.interop.invoke(Control.CONTROL_METHOD, command, target);
    }

    public subscribe(domain: ControlDomain, callback: (command: RemoteCommand) => void) {
        this.callbacks[domain] = callback;
    }

    public setLocalWindow(window: LocalWebWindow) {
        this.myWindow = window;
    }
}
