import { Glue42Web } from "../../web";

interface LocalStorageEntry {
    [name: string]: Glue42Web.Layouts.Layout;
}

export class LocalStorage {

    private static readonly KEY = "G0_layouts";

    public getAll(): Glue42Web.Layouts.Layout[] {
        const obj = this.getObjectFromLocalStorage();
        return Object.values(obj);
    }

    public get(name: string, type: Glue42Web.Layouts.LayoutType): Glue42Web.Layouts.Layout | undefined {
        const obj = this.getObjectFromLocalStorage();
        const key = this.getKey(name, type);
        return obj[key];
    }

    public save(layout: Glue42Web.Layouts.Layout): Promise<Glue42Web.Layouts.Layout> {
        const obj = this.getObjectFromLocalStorage();
        const key = this.getKey(layout.name, layout.type);
        obj[key] = layout;
        this.setObjectToLocalStorage(obj);
        return Promise.resolve(layout);
    }

    public remove(name: string, type: Glue42Web.Layouts.LayoutType): Promise<void> {
        const obj = this.getObjectFromLocalStorage();
        const key = this.getKey(name, type);
        delete obj[key];
        return Promise.resolve();
    }

    public clear(): Promise<void> {
        this.setObjectToLocalStorage({});
        return Promise.resolve();
    }

    private getObjectFromLocalStorage(): LocalStorageEntry {
        const values = window.localStorage.getItem(LocalStorage.KEY);
        if (values) {
            return JSON.parse(values);
        }
        return {};
    }

    private setObjectToLocalStorage(obj: LocalStorageEntry) {
        window.localStorage.setItem(LocalStorage.KEY, JSON.stringify(obj));
    }

    private getKey(name: string, type: string) {
        return `${type}_${name}`;
    }
}
