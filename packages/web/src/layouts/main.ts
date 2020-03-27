import { Glue42Web } from "../../web";
import { LocalStorage } from "./localStorage";
import { Windows } from "../windows/main";
import { Glue42Core } from "@glue42/core";
import { LocalWebWindow } from "../windows/my";
import { Control } from "../control/control";
import { SaveAutoLayoutCommandArgs, SaveAutoLayoutCommand, RemoteCommand } from "../control/commands";

export class Layouts implements Glue42Web.Layouts.API {
    private static readonly SaveContextMethodName = "T42.HC.GetSaveContext";
    private storage = new LocalStorage();
    private getLocalInfoCallback?: (context?: object | undefined) => Glue42Web.Layouts.SaveRequestResponse;
    private autoSaveContext: boolean;

    constructor(private windows: Windows, private interop: Glue42Core.Interop.API, private logger: Glue42Core.Logger.API, private control: Control, config?: Glue42Web.Config) {
        this.registerRequestMethods();
        this.control.subscribe("layouts", this.handleControlMessage.bind(this));
        this.autoSaveContext = config?.layouts?.autoSaveWindowContext ?? false;
    }

    public list(): Glue42Web.Layouts.Layout[] {
        return this.storage.getAll();
    }

    public async save(layoutOptions: Glue42Web.Layouts.NewLayoutOptions): Promise<Glue42Web.Layouts.Layout> {
        if (!layoutOptions.name) {
            return Promise.reject(`missing name for layout ${JSON.stringify(layoutOptions)}`);
        }

        const openedWindows = this.windows.getChildWindows().map((w) => w.id);
        const components: any[] = await this.getRemoteWindowsInfo(openedWindows);
        // push the local info
        components.push(this.getLocalLayoutComponent(layoutOptions.context, true));

        return this.storage.save({
            type: "Global",
            name: layoutOptions.name,
            components,
            context: layoutOptions.context || {},
            metadata: layoutOptions.metadata || {}
        });
    }

    public async restore(options: Glue42Web.Layouts.RestoreOptions): Promise<void> {
        const layout = this.list().find((l) => l.name === options.name && l.type === "Global");
        if (!layout) {
            throw new Error(`can not find layout with name ${options.name}`);
        }

        layout.components.forEach((c) => {
            if (c.type === "window") {
                // do not restore the parent
                if (c.main) {
                    return;
                }
                const newWindowOptions: Glue42Web.Windows.CreateOptions = { ...c.bounds, context: c.windowContext };
                this.windows.open(c.name, c.url, newWindowOptions);
            }
        });
    }

    public remove(type: Glue42Web.Layouts.LayoutType, name: string): Promise<void> {
        this.storage.remove(name, type);
        return Promise.resolve();
    }

    public onSaveRequested(callback: (context?: object | undefined) => Glue42Web.Layouts.SaveRequestResponse): () => void {
        this.getLocalInfoCallback = callback;
        return () => {
            this.getLocalInfoCallback = undefined;
        };
    }

    public getLocalLayoutComponent(context?: any, main: boolean = false): Glue42Web.Layouts.LayoutComponentInfo {
        let requestResult: Glue42Web.Layouts.SaveRequestResponse | undefined;
        const my = this.windows.my() as LocalWebWindow;

        try {
            if (this.autoSaveContext) {
                requestResult = {
                    windowContext: my.getContextSync()
                };
            }
            if (this.getLocalInfoCallback) {
                requestResult = this.getLocalInfoCallback(context);
            }
        } catch (err) {
            this.logger.warn(`onSaveRequested - error getting data from user function - ${err}`);
        }

        return {
            type: "window",
            name: my.name,
            windowContext: requestResult?.windowContext || {},
            bounds: my.getBoundsSync(),
            url: window.document.location.href,
            id: this.windows.my().id,
            main
        };
    }

    private registerRequestMethods() {
        this.interop.register(Layouts.SaveContextMethodName, (args) => {
            return this.getLocalLayoutComponent(args);
        });
    }

    private async handleControlMessage(command: RemoteCommand) {
        if (command.command === "saveAutoLayout") {
            const args = command.args as SaveAutoLayoutCommandArgs;
            const components = await this.getRemoteWindowsInfo(args.childWindows);
            components.push(args.parentInfo);
            await this.storage.save({
                type: "Global",
                name: args.layoutName,
                components,
                context: args.context || {},
                metadata: args.metadata || {}
            });
            // now close everyone
            args.childWindows.forEach((cw) => {
                this.windows.findById(cw)?.close();
            });
        }
    }

    private async getRemoteWindowsInfo(windows: string[]): Promise<Glue42Web.Layouts.LayoutComponentInfo[]> {
        const promises: Array<Promise<Glue42Core.Interop.InvocationResult<Glue42Web.Layouts.LayoutComponentInfo>>> = [];
        for (const id of windows) {
            const interopServer = this.interop.servers().find((s) => s.windowId === id);
            if (!interopServer || !interopServer.getMethods) {
                continue;
            }
            const methods = interopServer.getMethods();
            if (methods.find((m) => m.name === Layouts.SaveContextMethodName)) {
                try {
                    promises.push(this.interop.invoke<Glue42Web.Layouts.LayoutComponentInfo>(Layouts.SaveContextMethodName, {}, { windowId: id }));
                } catch  {
                    // swallow
                }
            }
        }

        const responses = await Promise.all(promises);
        return responses.map((response) => response.returned);
    }
}
