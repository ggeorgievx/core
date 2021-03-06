import { Base } from "./base/base";
import { Glue42Workspaces } from "../../workspaces.d";

interface PrivateData {
    base: Base;
}

const privateData = new WeakMap<Group, PrivateData>();

const getBase = (model: Group): Base => {
    return privateData.get(model).base;
};

export class Group implements Glue42Workspaces.Group {

    constructor(base: Base) {
        privateData.set(this, { base });
    }

    public get type(): "group" {
        return "group";
    }

    public get id(): string {
        return getBase(this).getId(this);
    }

    public get frameId(): string {
        return getBase(this).getFrameId(this);
    }

    public get workspaceId(): string {
        return getBase(this).getWorkspaceId(this);
    }

    public get positionIndex(): number {
        return getBase(this).getPositionIndex(this);
    }

    public get children(): Glue42Workspaces.WorkspaceElement[] {
        return getBase(this).getAllChildren(this);
    }
    public get parent(): Glue42Workspaces.Workspace | Glue42Workspaces.WorkspaceBox {
        return getBase(this).getMyParent(this);
    }
    public get frame(): Glue42Workspaces.Frame {
        return getBase(this).getMyFrame(this);
    }
    public get workspace(): Glue42Workspaces.Workspace {
        return getBase(this).getMyWorkspace(this);
    }

    public addWindow(definition: Glue42Workspaces.WorkspaceWindowDefinition): Promise<Glue42Workspaces.WorkspaceWindow> {
        return getBase(this).addWindow(this, definition, "group");
    }

    public async addGroup(): Promise<Group> {
        throw new Error("Adding groups as group child is not supported");
    }

    public async addColumn(): Promise<Glue42Workspaces.Column> {
        throw new Error("Adding columns as group child is not supported");
    }

    public async addRow(): Promise<Glue42Workspaces.Row> {
        throw new Error("Adding rows as group child is not supported");
    }

    public removeChild(predicate: (child: Glue42Workspaces.WorkspaceElement) => boolean): Promise<void> {
        return getBase(this).removeChild(this, predicate);
    }

    public maximize(): Promise<void> {
        return getBase(this).maximize(this);
    }

    public restore(): Promise<void> {
        return getBase(this).restore(this);
    }

    public close(): Promise<void> {
        return getBase(this).close(this);
    }

}
