import { Glue42Web } from "../../web";

export type ControlDomain = "windows" | "layouts";
export type LayoutCommand = "saveAutoLayout";

export interface RemoteCommand<T = any> {
    domain: ControlDomain;
    command: string;
    args?: T;
}

export interface LayoutRemoteCommand<T = any> extends RemoteCommand<T> {
    domain: "layouts";
    command: LayoutCommand;
    args?: T;
}

export interface SaveAutoLayoutCommand extends LayoutRemoteCommand<SaveAutoLayoutCommandArgs> {
    command: "saveAutoLayout";
}

export interface SaveAutoLayoutCommandArgs {
    layoutName: string;
    parentInfo: Glue42Web.Layouts.LayoutComponentInfo;
    childWindows: string[];
    closeEveryone: boolean;
    context: any;
    metadata: any;
}
