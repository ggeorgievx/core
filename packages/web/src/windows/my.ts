import { Control } from "../control/control";
import { default as CallbackFactory, UnsubscribeFunction } from "callback-registry";
import { Glue42Web } from "../../web";
import { Glue42 } from "@glue42/desktop";

/**
 * Our local window
 * Implements Glue42Web.Windows.WebWindow by calling direct methods of the browser window object
 */
export class LocalWebWindow implements Glue42Web.Windows.WebWindow {

    public parent?: string;

    private context = {};
    private registry = CallbackFactory();

    constructor(public id: string, public name: string, private window: Window, private control: Control, private interop: Glue42Web.Interop.API) {
        control.setLocalWindow(this);
    }

    public async getURL(): Promise<string> {
        return this.window.location.href;
    }

    public async moveResize({ left, top, width, height }: Partial<Glue42Web.Windows.Bounds>): Promise<Glue42Web.Windows.WebWindow> {
        left = left ?? window.screenLeft;
        top = top ?? window.screenTop;
        width = width ?? window.outerWidth;
        height = height ?? window.outerHeight;
        window.moveTo(left, top);
        window.resizeTo(width, height);
        return this;
    }

    public async close(): Promise<Glue42Web.Windows.WebWindow> {
        if (!this.parent) {
            throw new Error("can not close window if it's not opened by script");
        }
        try {
            window.close();
        } catch {
            // tslint:disable-next-line:no-console
            console.log("what");
        }
        return this;
    }

    public async setTitle(title: string | { title: string }): Promise<Glue42Web.Windows.WebWindow> {
        if (typeof title === "object" && title !== null) {
            title = title.title;
        }
        document.title = title;
        return this;
    }

    public async resizeTo(width?: number | undefined, height?: number | undefined): Promise<Glue42Web.Windows.WebWindow> {
        await this.moveResize({ width, height });
        return this;
    }

    public async moveTo(top?: number | undefined, left?: number | undefined): Promise<Glue42Web.Windows.WebWindow> {
        await this.moveResize({ top, left });
        return this;
    }

    public async getBounds(): Promise<Glue42Web.Windows.Bounds> {
        return this.getBoundsSync();
    }

    public async getContext(): Promise<any> {
        return this.getContextSync();
    }

    public getContextSync(): object {
        return this.context;
    }

    public async getTitle(): Promise<string> {
        return this.window.document.title;
    }

    public onContextUpdated(callback: (context: any, oldContext: any) => void): UnsubscribeFunction {
        return this.registry.add("context-updated", callback);
    }

    public updateContext(context: any): Promise<Glue42Web.Windows.WebWindow> {
        const oldContext = this.context;
        this.context = Object.assign({}, context, oldContext);
        this.registry.execute("context-updated", context, oldContext);
        return Promise.resolve(this);
    }

    public async setContext(context: any): Promise<Glue42Web.Windows.WebWindow> {
        const oldContext = this.context;
        this.context = Object.assign({}, context);
        this.registry.execute("context-updated", context, oldContext);
        return Promise.resolve(this);
    }

    public getBoundsSync(): Glue42Web.Windows.Bounds {
        return {
            left: this.window.screenLeft,
            top: this.window.screenTop,
            width: this.window.outerWidth,
            height: this.window.outerHeight
        };
    }
}
